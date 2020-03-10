const Joi = require( '@hapi/joi' );
const config = require( '../../config' );
const options = { allowUnknown: true, stripUnknown: true };
const { LANGUAGES } = require( '../../config/constants' );

exports.hasSocialShcema = Joi.object().keys( {
    provider: Joi.string().required(),
    id: Joi.string().required()
} ).options( options );

exports.socialAuthShcema = Joi.object().keys( {
    userName: Joi.string().pattern( new RegExp( `^(${config.guestPrefixes.waivio}|${config.guestPrefixes.investarena}|${config.guestPrefixes.beaxy})_[a-zA-Z0-9\.\-]{1,25}$` ) ),
    avatar: Joi.string().pattern( new RegExp( '^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&\'\\(\\)\\*\\+,;=.]+$' ) ).allow( '' ).default( '' ),
    alias: Joi.string().allow( '' ),
    locales: Joi.array().items( Joi.string().valid( ...LANGUAGES ) )
} ).unknown( true );

exports.socialBeaxySchema = Joi.object().keys( {
    authBy: Joi.string().valid( 'credentials', '2fa' ).required(),
    authData: Joi.when( 'authBy', {
        is: 'credentials',
        then: Joi.object().keys( {
            user: Joi.string().required(),
            password: Joi.string().required()
        } ),
        otherwise: Joi.object().keys( {
            token2fa: Joi.string().required(),
            code: Joi.number().required(),
            user: Joi.string().required()
        } )
    } )
} );
