const FacebookStrategy = require('passport-facebook-token');
const InstagramStrategy = require('passport-instagram-token');
const GoogleStrategy = require('passport-google-token').Strategy;
const config = require('../../config');

module.exports = async (passport) => {
  const facebookCredentials = {
    clientID: config.facebookAppId,
    clientSecret: config.facebookAppSecret,
  };
  const googleCredentials = {
    clientID: config.googleAppId,
    clientSecret: config.googleAppSecret,
  };

  passport.use('facebook', new FacebookStrategy(facebookCredentials, getSocialFields));
  passport.use('instagram', new InstagramStrategy(facebookCredentials, getSocialFields));
  passport.use('google', new GoogleStrategy(googleCredentials, getSocialFields));
};

const getSocialFields = async (accessToken, refreshToken, profile, next) => {
  const { provider } = profile;
  const {
    id, name, picture, email,
  } = profile._json;
  const avatar = picture || (profile.photos && profile.photos[0].value);

  next({
    fields: {
      alias: name, provider, avatar, id, email,
    },
  });
};
