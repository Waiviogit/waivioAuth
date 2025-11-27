const { models } = require('../database');
const config = require('../config');

const { HiveNonce } = models;

const buildExpirationDate = () => new Date(Date.now() + (config.nonceTtlSeconds * 1000));

const createNonce = async ({
  username,
  nonce,
  ip,
  userAgent,
}) => {
  const now = new Date();

  return HiveNonce.create({
    username,
    nonce,
    createdAt: now,
    expiresAt: buildExpirationDate(),
    used: false,
    ip,
    userAgent,
  });
};

const findNonce = async ({ username, nonce }) => HiveNonce.findOne({ username, nonce });

const markNonceUsed = async ({ id }) => HiveNonce.updateOne(
  { _id: id, used: false },
  { $set: { used: true } },
);

module.exports = {
  createNonce,
  findNonce,
  markNonceUsed,
};
