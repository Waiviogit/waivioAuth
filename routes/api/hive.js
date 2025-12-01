const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { HiveAuthController } = require('../../controllers');
const hiveJwt = require('../../middlewares/hiveJwt');
const config = require('../../config');

const createLimiter = ({
  windowMs, max, skipFailedRequests = false, keyGenerator,
}) => rateLimit({
  windowMs,
  limit: max,
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests,
  keyGenerator,
});

const challengeLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: (req) => `${req.ip}:${req.query.username || ''}`,
});

const loginLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 15,
  keyGenerator: (req) => `${req.ip}:${req.body?.username || ''}`,
});

const metricsGuard = (req, res, next) => {
  if (!config.apiKey) return next();
  if (req.headers['x-api-key'] === config.apiKey) return next();
  return res.status(403).json({
    error: 'forbidden',
    message: 'Valid API key required',
  });
};

router.get('/hive/challenge', challengeLimiter, HiveAuthController.issueChallenge);
router.post('/login-keychain', loginLimiter, HiveAuthController.loginWithKeychain);
router.get('/hive/me', hiveJwt, HiveAuthController.me);
router.get('/hive/metrics', metricsGuard, HiveAuthController.metricsSnapshot);

module.exports = router;
