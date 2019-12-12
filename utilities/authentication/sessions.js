const jwt = require( 'jsonwebtoken' );
const crypto = require( 'crypto-js' );
const { encodeToken, decodeToken } = require( './tokenSalt' );
const config = require( '../../config/index' );
const { ObjectID } = require( 'bson' );

const generateSession = ( ) => {
    return {
        sid: new ObjectID(),
        secret_token: crypto.SHA512( `${new Date()}` ).toString()
    };
};

const setAuthHeaders = ( res, client, session ) => {
    const access_token = token_sign( client, session );

    res.setHeader( 'access_token', encodeToken( { access_token } ) );
};

const token_sign = ( self, token_hash ) => {
    return jwt.sign(
        { name: self.name, id: self._id, sid: token_hash.sid },
        token_hash.secret_token,
        { expiresIn: config.session_expiration } );
};

module.exports = { setAuthHeaders, generateSession, decodeToken };
