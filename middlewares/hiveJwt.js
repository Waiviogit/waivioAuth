const { verifyHiveJwt } = require('../utilities/authentication/hiveJwt');

const hiveJwtMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (!token || scheme !== 'Bearer') {
    return res.status(401).json({
      error: 'token_missing',
      message: 'Authorization header with Bearer token is required',
    });
  }

  try {
    req.hiveAuth = verifyHiveJwt(token);
    return next();
  } catch (error) {
    return res.status(401).json({
      error: 'invalid_token',
      message: error.message,
    });
  }
};

module.exports = hiveJwtMiddleware;
