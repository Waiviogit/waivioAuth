const { Client, Signature } = require('@hiveio/dhive');
const crypto = require('crypto');
const config = require('../../config');

const hiveClient = new Client(config.hiveRpcNodes, {
  failoverThreshold: 5,
  timeout: 4000,
});

const accountCache = new Map();

const getCachedAccount = (username) => {
  const cached = accountCache.get(username);

  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    accountCache.delete(username);
    return null;
  }
  return cached.account;
};

const setCachedAccount = (username, account) => {
  accountCache.set(username, {
    account,
    expiresAt: Date.now() + config.hiveAccountCacheMs,
  });
};

const getAccount = async (username) => {
  const cached = getCachedAccount(username);
  if (cached) return cached;

  const [account] = await hiveClient.database.getAccounts([username]);
  if (!account) return null;

  setCachedAccount(username, account);
  return account;
};

const verifyPostingSignature = ({ nonce, signature, postingKeys }) => {
  try {
    const digest = crypto.createHash('sha256')
      .update(nonce, 'utf8')
      .digest();

    const recoveredPubKey = Signature
      .fromString(signature)
      .recover(digest)
      .toString();

    return {
      ok: postingKeys.includes(recoveredPubKey),
      recoveredPubKey,
    };
  } catch (error) {
    return {
      error: 'invalid_signature_format',
      message: error.message,
    };
  }
};

module.exports = {
  hiveClient,
  getAccount,
  verifyPostingSignature,
};
