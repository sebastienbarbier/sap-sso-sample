require('dotenv').config()
const {
  IDP_CLIENT_ID, 
  IDP_CLIENT_SECRET, 
  IDP_URL_AUTHORIZE, 
  IDP_URL_TOKEN, 
  IDP_URL_CALLBACK,
  SESSION_SECRET
} = process.env;
const PORT = process.env.PORT || 80;

var express = require('express')
  , fetch = require('node-fetch')
  , path = require('path')
  , passport = require('passport')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , jwt = require('jsonwebtoken')
  , BearerStrategy = require('passport-http-bearer').Strategy
  , session = require("express-session")
  , bodyParser = require("body-parser");

// Initialise express web server
const app = express();

// For demo purpose, provide a mocked db to handle user
const User = require('./users');
const cloud = require('./cloud');
const middlewares = require('./middlewares');

//
// STEP 1. provide passport urls to fetch user data
//

// API to handle OAuth2 indentification flow and identify user
passport.use('provider', new OAuth2Strategy({
    clientID: IDP_CLIENT_ID,
    clientSecret: IDP_CLIENT_SECRET,
    authorizationURL: IDP_URL_AUTHORIZE,
    tokenURL: IDP_URL_TOKEN,
    callbackURL: IDP_URL_CALLBACK,
    customHeaders: {
      'Authorization': 'Basic ' + Buffer.from(`${IDP_CLIENT_ID}:${IDP_CLIENT_SECRET}`, 'utf-8').toString('base64')
    }
  },
  function(jwtToken, refreshToken, profile, done) {
    // jwtToken is retuned by the IDP with the user email.
    done(null, jwtToken ? jwt.decode(jwtToken).mail : false);
  }
));

// Will redirect the user to the IDP login.
app.get('/auth/provider',
  passport.authenticate('provider', { scope: 'openid' })
);

// REST API to get the authn bearer Token from the extension API
app.get('/auth/provider/callback', function(req, res, next) {
  passport.authenticate('provider', async function(err, mail, info) {
    if (err) { return next(err); }
    if (!mail) { return res.status(401); }

    // Verify if IDP account has same email as FSM user. 
    const userObject = await cloud.queryUserObject(req.headers['cloudhost'], req.headers['account'], req.headers['userid']);

    if (userObject.email == mail) {
      // A user is defined by its cloudhost, account, and fsm user id
      // For the purpose of this demo, we populate cloudhost and account to the user object
      userObject.cluster_url = req.headers['cloudhost'];
      userObject.account = req.headers['account'];

      // Get local user and bearer token associated
      // This minimalist example should be enhanced with stronger token protection
      User.findOrCreate(userObject, function(err, userObject, token) {
        return err ? next(err) : res.json({ token });
      });
    } else {
      return res.status(401).send({ message: 'Wrong credential' });
    }
  })(req, res, next);
});

// 
// STEP 2. Create a bearer token to protect extensions' API 
//

// Passport use serializeUser to generate a string to associate to the bearer token
passport.serializeUser(function(user, done) {
  done(null, user.uuid);
});

// Passport use deserializeUser to fetch a user from the associated string from serializeUser
passport.deserializeUser(function(uuid, done) {
  User.findById(uuid, function(err, user) {
    done(err, user);
  });
});

// Fetch user object from Bearer token
passport.use(new BearerStrategy(
  function(token, done) {
    User.findByToken(token, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      return done(null, user, { scope: 'read' });
    });
  }
));

//
// STEP 3. Create protected REST API
//

//  Return user object based on the bearer Token
app.get('/api/me',
  middlewares.authenticate,
  function(req, res) {
    // middlewares.authenticate populate req with req.user, req.access_token
    res.json(req.user);
  });

//
// STEP 4. Initialise express node server to listen http request.
//
app.use(session({ secret: SESSION_SECRET, resave: true, saveUninitialized: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('static'));
app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));