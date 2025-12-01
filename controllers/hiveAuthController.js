const crypto = require('crypto');
const validators = require('./validators');
const { HiveNonceModel } = require('../models');
const { signHiveJwt } = require('../utilities/authentication/hiveJwt');
const { getAccount, verifyPostingSignature } = require('../utilities/hive/client');
const metrics = require('../utilities/metrics/hiveAuthMetrics');
const config = require('../config');

const MAX_LOGIN_BODY_BYTES = 4 * 1024;

const usernameErrorResponse = {
  error: 'invalid_username',
  message: 'username must match Hive account naming rules',
};

const handleValidationFailure = (res, error) => res.status(400).json({
  error: 'validation_error',
  message: error.details?.map((detail) => detail.message).join(', ') || 'Invalid request payload',
});

const issueChallenge = async (req, res) => {
  const { validation_error, params } = validators.validate(req.query, validators.hiveAuth.challengeSchema);
  if (validation_error) {
    metrics.recordChallenge({ success: false, errorCode: 'invalid_username' });
    return res.status(400).json(usernameErrorResponse);
  }

  const nonce = crypto.randomBytes(32).toString('hex');

  try {
    await HiveNonceModel.createNonce({
      username: params.username,
      nonce,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    metrics.recordChallenge({ success: true });
    console.info('[HiveAuth] Challenge issued', { username: params.username, ip: req.ip });

    return res.json({
      nonce,
      username: params.username,
      expiresIn: config.nonceTtlSeconds,
    });
  } catch (error) {
    metrics.recordChallenge({ success: false, errorCode: 'challenge_store_failed' });
    console.error('[HiveAuth] Challenge storage failed', { error: error.message });
    return res.status(500).json({
      error: 'challenge_store_failed',
      message: 'Unable to store challenge, please retry',
    });
  }
};

const checkBodySize = (req) => {
  const contentLengthHeader = req.get('content-length');
  if (!contentLengthHeader) return false;
  const contentLength = parseInt(contentLengthHeader, 10);
  if (!Number.isFinite(contentLength)) return false;
  return contentLength > MAX_LOGIN_BODY_BYTES;
};

const loginWithKeychain = async (req, res) => {
  if (checkBodySize(req)) {
    metrics.recordLogin({ success: false, errorCode: 'payload_too_large' });
    return res.status(413).json({
      error: 'payload_too_large',
      message: 'Request body exceeds 4KB limit',
    });
  }

  const { validation_error, params } = validators.validate(req.body, validators.hiveAuth.loginSchema);
  if (validation_error) {
    metrics.recordLogin({ success: false, errorCode: 'validation_error' });
    return handleValidationFailure(res, validation_error);
  }

  let nonceRecord;

  try {
    nonceRecord = await HiveNonceModel.findNonce({ username: params.username, nonce: params.nonce });
  } catch (error) {
    metrics.recordLogin({ success: false, errorCode: 'nonce_lookup_failed' });
    console.error('[HiveAuth] Failed to lookup nonce', { error: error.message });
    return res.status(500).json({
      error: 'nonce_lookup_failed',
      message: 'Unable to verify nonce',
    });
  }

  if (!nonceRecord) {
    metrics.recordLogin({ success: false, errorCode: 'invalid_nonce' });
    return res.status(400).json({
      error: 'invalid_nonce',
      message: 'Nonce not found',
    });
  }

  if (nonceRecord.used) {
    metrics.recordLogin({ success: false, errorCode: 'nonce_used' });
    return res.status(400).json({
      error: 'nonce_used',
      message: 'Nonce already used',
    });
  }

  if (nonceRecord.expiresAt < new Date()) {
    metrics.recordLogin({ success: false, errorCode: 'nonce_expired' });
    return res.status(400).json({
      error: 'nonce_expired',
      message: 'Nonce expired',
    });
  }

  let account;

  try {
    account = await getAccount(params.username);
  } catch (error) {
    metrics.recordLogin({ success: false, errorCode: 'hive_rpc_error' });
    console.error('[HiveAuth] Hive RPC failure', { error: error.message });
    return res.status(502).json({
      error: 'hive_rpc_error',
      message: 'Unable to reach Hive RPC node',
    });
  }

  if (!account) {
    metrics.recordLogin({ success: false, errorCode: 'unknown_account' });
    return res.status(400).json({
      error: 'unknown_account',
      message: 'Hive account not found',
    });
  }

  const postingKeys = (account.posting?.key_auths || []).map((entry) => entry[0]);

  if (!postingKeys.length) {
    metrics.recordLogin({ success: false, errorCode: 'no_posting_keys' });
    return res.status(403).json({
      error: 'signature_not_authorized',
      message: 'No posting keys available for verification',
    });
  }

  const verification = verifyPostingSignature({
    nonce: params.nonce,
    signature: params.signature,
    postingKeys,
  });

  if (verification.error) {
    metrics.recordLogin({ success: false, errorCode: verification.error });
    return res.status(400).json({
      error: verification.error,
      message: 'Signature is malformed',
    });
  }

  if (!verification.ok) {
    metrics.recordLogin({ success: false, errorCode: 'signature_not_authorized' });
    return res.status(403).json({
      error: 'signature_not_authorized',
      message: 'Signature not produced by allowed posting key',
    });
  }

  try {
    const updateResult = await HiveNonceModel.markNonceUsed({ id: nonceRecord._id });
    if (!updateResult.modifiedCount) {
      metrics.recordLogin({ success: false, errorCode: 'nonce_used' });
      return res.status(400).json({
        error: 'nonce_used',
        message: 'Nonce already used',
      });
    }
  } catch (error) {
    metrics.recordLogin({ success: false, errorCode: 'nonce_mark_failed' });
    console.error('[HiveAuth] Failed to mark nonce as used', { error: error.message });
    return res.status(500).json({
      error: 'nonce_mark_failed',
      message: 'Unable to finalize login',
    });
  }

  try {
    const signed = signHiveJwt({ username: params.username });
    metrics.recordLogin({ success: true });
    console.info('[HiveAuth] Login success', { username: params.username, pubKey: verification.recoveredPubKey });

    return res.json({
      token: signed.token,
      tokenType: signed.tokenType,
      expiresIn: signed.expiresIn,
      expiresAt: signed.expiresAt,
      username: params.username,
      loginMethod: 'hive_keychain',
    });
  } catch (error) {
    metrics.recordLogin({ success: false, errorCode: 'jwt_issue_failed' });
    console.error('[HiveAuth] Failed to issue JWT', { error: error.message });
    return res.status(500).json({
      error: 'jwt_issue_failed',
      message: 'Unable to issue token',
    });
  }
};

const me = (req, res) => res.json({
  username: req.hiveAuth?.username,
  loginMethod: req.hiveAuth?.loginMethod,
  exp: req.hiveAuth?.exp,
  iat: req.hiveAuth?.iat,
});

const metricsSnapshot = (req, res) => res.json(metrics.getMetricsSnapshot());

module.exports = {
  issueChallenge,
  loginWithKeychain,
  me,
  metricsSnapshot,
};
