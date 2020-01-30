const Joi = require( '@hapi/joi' );
const config = require( '../../config' );
const options = { allowUnknown: true, stripUnknown: true };
const { LANGUAGES } = require( '../../config/constants' );

exports.hasSocialShcema = Joi.object().keys( {
    provider: Joi.string().required(),
    id: Joi.string().required()
} ).options( options );

exports.socialAuthShcema = Joi.object().keys( {
    userName: Joi.string().pattern( new RegExp( `^(${config.appName}_)[a-zA-Z0-9\.\-]{1,25}$` ) ).required(),
    avatar: Joi.string().pattern( new RegExp( '^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&\'\\(\\)\\*\\+,;=.]+$' ) ).default( '' ),
    alias: Joi.string(),
    locales: Joi.array().items( Joi.string().valid( ...LANGUAGES ) )
} ).unknown( true );

