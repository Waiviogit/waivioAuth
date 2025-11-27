const Joi = require('joi');

const hiveUsernameRegex = /^[a-z][a-z0-9\-\.]{2,15}$/;

const baseOptions = { allowUnknown: false, stripUnknown: true };

exports.challengeSchema = Joi.object({
  username: Joi.string().pattern(hiveUsernameRegex).required(),
}).options(baseOptions);

exports.loginSchema = Joi.object({
  username: Joi.string().pattern(hiveUsernameRegex).required(),
  nonce: Joi.string().min(16).max(128).required(),
  signature: Joi.string().min(40).max(500).required(),
  publicKey: Joi.string().min(10).max(100).optional(),
}).options(baseOptions);
