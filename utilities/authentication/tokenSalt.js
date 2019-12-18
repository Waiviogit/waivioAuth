const config = require( '../../config/index' );
const crypto = require( 'crypto-js' );

const encodeToken = ( { access_token } ) => {
    return crypto.AES.encrypt( access_token, config.crypto_key ).toString();
};

const decodeToken = async ( { access_token } ) => {
    try{
        return crypto.AES.decrypt( access_token, config.crypto_key ).toString( crypto.enc.Utf8 );
    } catch( error ) {
        return null;
    }
};

module.exports = { encodeToken, decodeToken };
