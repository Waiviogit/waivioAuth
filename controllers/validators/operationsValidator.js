const Joi = require( '@hapi/joi' );
const _ = require( 'lodash' );
const { guestActions } = require( '../../config/constants' );
const options = { allowUnknown: true, stripUnknown: true };

exports.transportShcema = Joi.object().keys( {
    guestReview: Joi.boolean(),
    id: Joi.string().valid( ..._.flattenDeep( Object.values( guestActions ) ) ).required(),
    data: Joi.object().required(),
    userName: Joi.string()
} ).options( options );
