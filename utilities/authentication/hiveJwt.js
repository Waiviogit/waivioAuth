const jwt = require('jsonwebtoken');
const config = require('../../config');

const ensureSecret = () => {
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }
};

const signHiveJwt = ({ username }) => {
  ensureSecret();

  const payload = {
    sub: username,
    username,
    loginMethod: 'hive_keychain',
    keyType: 'posting',
  };

  const token = jwt.sign(payload, config.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: config.jwtExpiresIn,
  });
  const decoded = jwt.decode(token);

  return {
    token,
    tokenType: 'Bearer',
    expiresAt: decoded?.exp,
    expiresIn: decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : undefined,
    payload,
  };
};

const verifyHiveJwt = (token) => {
  ensureSecret();
  return jwt.verify(token, config.jwtSecret);
};

module.exports = {
  signHiveJwt,
  verifyHiveJwt,
};
