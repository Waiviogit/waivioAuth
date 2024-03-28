const config = require('./config.json')[process.env.NODE_ENV || 'development'];

const envConfig = {
  mongoConnectionString: process.env.MONGO_URI_WAIVIO || `mongodb://${config.db.host}:${config.db.port}/${config.db.database}`,
  port: process.env.PORT || 8004,
  guestPrefix: process.env.GUEST_PREFIX || 'waivio',
  accessKey: process.env.ACCESS_KEY,
  refreshKey: process.env.REFRESH_KEY,
  apiKey: process.env.API_KEY,
  facebookAppId: process.env.FACEBOOK_APP_ID,
  facebookAppSecret: process.env.FACEBOOK_APP_SECRET,
  googleAppId: process.env.GOOGLE_APP_ID,
  googleAppSecret: process.env.GOOGLE_APP_SECRET,
  // for tests
  crypto_key: process.env.CRYPTO_KEY || 'ef293fdaf619a7d6a440815cd342a7ce',
};

module.exports = Object.freeze({
  ...config,
  ...envConfig,
});
