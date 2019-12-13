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
    const { access_token, expires_in } = token_sign( client, session );

    res.setHeader( 'access-token', encodeToken( { access_token } ) );
    res.setHeader( 'expires-in', expires_in );
    res.setHeader( 'waivio-auth', true );
};

const token_sign = ( self, token_hash ) => {
    const access_token = jwt.sign(
        { name: self.name, id: self._id, sid: token_hash.sid },
        token_hash.secret_token,
        { expiresIn: config.session_expiration } );

    return { access_token, expires_in: jwt.decode( access_token ).exp };
};

module.exports = { setAuthHeaders, generateSession, decodeToken };
