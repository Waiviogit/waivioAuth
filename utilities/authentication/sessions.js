const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../../config');

const setAuthHeaders = (res, client) => {
  const { access_token, expires_in, refresh_token } = tokenSign(client);

  res.setHeader('access-token', access_token);
  res.setHeader('refresh-token', refresh_token);
  res.setHeader('expires-in', expires_in);
  res.setHeader('waivio-auth', true);
};

const getAuthData = async ({ access_token }) => {
  const payload = await jwt.decode(access_token);

  if (!payload || !payload.id || !access_token) return { error: 'Invalid token' };
  return { payload, access_token };
};

const findSession = ({ sessions, sid }) => _.find(sessions, (hash) => hash.sid === sid);

const tokenSign = (user) => {
  const access_token = jwt.sign(
    { name: user.name, id: user._id },
    config.accessKey,
    { expiresIn: config.session_expiration },
  );
  const refresh_token = jwt.sign(
    { name: user.name, id: user._id },
    config.refreshKey,
    { expiresIn: config.refresh_expiration },
  );

  return { access_token, expires_in: jwt.decode(access_token).exp, refresh_token };
};

const verifyToken = ({ access_token, secretKey }) => {
  try {
    jwt.verify(access_token, secretKey);
    return { result: true };
  } catch (error) {
    if (error.message === 'jwt expired' && error.expiredAt > moment.utc().subtract(1, 'minutes')) {
      return { result: true };
    }
    return { result: false };
  }
};

module.exports = {
  tokenSign,
  setAuthHeaders,
  verifyToken,
  findSession,
  getAuthData,
};
