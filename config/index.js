const config = require('./config.json')[process.env.NODE_ENV || 'development'];

const parseList = (value, fallback) => {
  if (!value || typeof value !== 'string') return fallback;
  const list = value.split(',').map((item) => item.trim()).filter(Boolean);
  return list.length ? list : fallback;
};

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

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
  hiveRpcNodes: parseList(process.env.HIVE_RPC_NODES, ['https://api.hive.blog']),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  nonceTtlSeconds: parsePositiveInt(process.env.NONCE_TTL_SECONDS, 300),
  hiveAccountCacheMs: parsePositiveInt(process.env.HIVE_ACCOUNT_CACHE_MS, 60000),
  // for tests
  crypto_key: process.env.CRYPTO_KEY || 'ef293fdaf619a7d6a440815cd342a7ce',
};

module.exports = Object.freeze({
  ...config,
  ...envConfig,
});
