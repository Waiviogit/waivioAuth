const config = require( '../../config/index' );
const crypto = require( 'crypto' );

const encodeToken = ( data ) => {
    let cipher = crypto.createCipher( 'aes-256-cbc', config.crypto_key );

    try{
        let crypted = cipher.update( data, 'utf8', 'hex' );

        crypted += cipher.final( 'hex' );

        return crypted;
    } catch( error ) {
        return null;
    }
};

const decodeToken = async ( data ) => {
    let decipher = await crypto.createDecipher( 'aes-256-cbc', config.crypto_key );

    try{
        let decrypted = await decipher.update( data, 'hex', 'utf8' );

        decrypted += decipher.final( 'utf8' );
        return decrypted;
    } catch( error ) {
        return null;
    }

};

module.exports = { encodeToken, decodeToken };
