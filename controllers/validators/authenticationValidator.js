const Joi = require('joi');
const config = require('../../config');

const options = { allowUnknown: true, stripUnknown: true };
const { LANGUAGES } = require('../../config/constants');

exports.hasSocialShcema = Joi.object().keys({
  provider: Joi.string().required(),
  id: Joi.string().required(),
}).options(options);

exports.socialAuthShcema = Joi.object().keys({
  userName: Joi.string().pattern(new RegExp(`^${config.guestPrefix}_[a-zA-Z0-9\.\-]{1,25}$`)),
  avatar: Joi.string().pattern(new RegExp('^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&\'\\(\\)\\*\\+,;=.]+$')).allow('').default(''),
  alias: Joi.string().allow(''),
  allowEmail: Joi.boolean().default(false),
  nightMode: Joi.boolean().default(false),
  locales: Joi.array().items(Joi.string().valid(...LANGUAGES)),
}).unknown(true);

exports.socialBeaxySchema = Joi.object().keys({
  authBy: Joi.string().valid('credentials', '2fa').required(),
  nightMode: Joi.boolean().default(false),
  authData: Joi.when('authBy', {
    is: 'credentials',
    then: Joi.object().keys({
      user: Joi.string().required(),
      password: Joi.string().required(),
    }),
    otherwise: Joi.object().keys({
      token2fa: Joi.string().required(),
      code: Joi.string().length(6).required(),
      user: Joi.string().required(),
    }),
  }),
});

exports.createUserSchema = Joi.object().keys({
  userName: Joi.string().pattern(new RegExp(`^${config.guestPrefix}_[a-zA-Z0-9\.\-]{1,25}$`)),
  avatar: Joi.string().pattern(new RegExp('^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&\'\\(\\)\\*\\+,;=.]+$')).allow(null).default(''),
  alias: Joi.string().allow(''),
  postLocales: Joi.array().items(Joi.string().valid(...LANGUAGES)).required(),
  email: Joi.string().allow(null).default(null),
  id: Joi.string().required(),
  nightMode: Joi.boolean().default(false),
  provider: Joi.string().required(),
});
