/* global WIKI */

// ------------------------------------
// WFiIS Account
// ------------------------------------

const request = require("request-promise");
const OAuth2Strategy = require('passport-oauth2').Strategy

module.exports = {
  init (passport, conf) {
    const strategy = new OAuth2Strategy({
      authorizationURL: conf.authorizationURL,
      tokenURL: conf.tokenURL,
      clientID: conf.clientId,
      clientSecret: conf.clientSecret,
      callbackURL: conf.callbackURL
    }, (accessToken, refreshToken, profile, cb) => {
      console.log({ accessToken, refreshToken, profile });
      WIKI.models.users.processProfile({ profile, providerKey: 'wfiis' }).then((user) => {
        return cb(null, user) || true
      }).catch((err) => {
        console.error(err);
        return cb(err, null) || true
      })
    });

    strategy.userProfile = (accessToken, done) => {
      request({
        uri: conf.profileURL,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        json: true,
      }).then(data => done(null, data)).catch(err => done(err));
    };

    passport.use('wfiis', strategy);
  }
}
