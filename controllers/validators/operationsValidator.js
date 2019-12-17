const Joi = require( '@hapi/joi' );
const options = { allowUnknown: true, stripUnknown: true };

exports.transportShcema = Joi.object().keys( {
    id: Joi.string().valid(
        'waivio_guest_follow',
        'waivio_guest_follow_wobject',
        'waivio_guest_vote',
        'waivio_guest_comment',
        'waivio_guest_update' ).required(),
    data: Joi.object().required(),
    userName: Joi.string()
} ).options( options );
