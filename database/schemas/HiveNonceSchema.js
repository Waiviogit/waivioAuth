const mongoose = require('mongoose');

const hiveUsernameRegex = /^[a-z][a-z0-9\-\.]{2,15}$/;

const HiveNonceSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: true,
    match: hiveUsernameRegex,
  },
  nonce: {
    type: String,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  used: {
    type: Boolean,
    default: false,
    index: true,
  },
  ip: String,
  userAgent: String,
}, {
  collection: 'hive_nonces',
  timestamps: false,
});

HiveNonceSchema.index({ username: 1, nonce: 1 }, { unique: true });
HiveNonceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('HiveNonce', HiveNonceSchema);
