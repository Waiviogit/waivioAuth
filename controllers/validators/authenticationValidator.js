const Joi = require( '@hapi/joi' );
const options = { allowUnknown: true, stripUnknown: true };

exports.hasSocialShcema = Joi.object().keys( {
    provider: Joi.string().required(),
    id: Joi.string().required()
} ).options( options );
