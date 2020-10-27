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
  , path = require('path')
  , passport = require('passport')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , jwt = require('jsonwebtoken');

// Initialise express web server
const app = express();

// For demo purpose, provide a mocked db to handle user
const User = require('./db_mock_users');

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
  function(accessToken, refreshToken, profile, done) {
    if (!accessToken) {
      done(null, false);
    }

    User.findOrCreate(jwt.decode(accessToken), function(err, user, token) {
      console.log(user);
      done(err, user, { token });
    });
  }
));

app.get('/auth/provider',
  passport.authenticate('provider', { scope: 'openid' })
);
// app.get('/auth/provider/callback',
//   passport.authenticate('provider', { successRedirect: '/callback.html',
//                                       failureRedirect: '/' }));
app.get('/auth/provider/callback', function(req, res, next) {
  passport.authenticate('provider', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/'); }
    return res.redirect('/callback.html?token=' + info.token);
  })(req, res, next);
});


// PASSPORT SESSION: for demo purpose

// The serialization and deserialization logic is supplied by the application, 
// allowing the application to choose an appropriate database and/or object mapper, 
// without imposition by the authentication layer.

var BearerStrategy = require('passport-http-bearer').Strategy
  , session = require("express-session")
  , bodyParser = require("body-parser");


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new BearerStrategy(
  function(token, done) {
    User.findByToken(token, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      return done(null, user, { scope: 'read' });
    });
  }
));

app.get('/api/me',
  passport.authenticate('bearer', { session: false }),
  function(req, res) {

    res.json(req.user);
  });

// app.use(express.static("public"));
app.use(session({ secret: SESSION_SECRET, resave: true, saveUninitialized: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());


// Expose static folder to load html content
app.use(express.static('static'));
app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));