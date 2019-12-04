const jwt = require( 'jsonwebtoken' );
const crypto = require( 'crypto' );
const { encodeToken, decodeToken } = require( './encodeDecodeToken' );
const config = require( '../../config/index' );

const generateAuthToken = ( ) => {
    return {
        sid: crypto.randomBytes( 16 ).toString( 'hex' ),
        secret_token: crypto.randomBytes( 16 ).toString( 'hex' ),
    };
};

const setAuthHeaders = ( res, client, session ) => {
    const access_token = token_sign( client, session );

    res.setHeader( 'access-token', encodeToken( access_token ) );
};

const token_sign = ( self, token_hash ) => {
    return jwt.sign(
        { email: self.email, permissions: [ self.role ], id: self._id, sid: token_hash.sid },
        token_hash.token_secret,
        { expiresIn: config.session_expiration } );
};

module.exports = { setAuthHeaders, generateAuthToken, decodeToken };
