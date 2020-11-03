const oauth = require('./oauth');
const passport = require('passport');

const authenticate = (req, res, next) => {
  passport.authenticate('bearer', { session: false })(req, res, async () => {
    if (req.user) {
      if (!req.headers['cloudhost']) return res.status(401).send({ message: 'Missing cloudHost header' });
      req.cluster_url = req.headers['cloudhost'];
      if (!req.headers['account']) return res.status(401).send({ message: 'Missing account header' });
      req.account = req.headers['account'];
      if (!req.headers['userid']) return res.status(401).send({ message: 'Missing userId header' });
      req.userId = req.headers['userid'];

      if (req.user.cluster_url != req.cluster_url ||
          req.user.account != req.account ||
          req.user.id != req.userId ) {
        return res.status(401).send({ message: 'Wrong credential' });
      } else {
        req.access_token = await oauth.fetch(req.headers['cloudhost'], req.headers['account']);
      }
    } else {
     return res.status(401).send({ message: 'Unknown token' });
    }
    next();
  });
};


exports.authenticate = authenticate;