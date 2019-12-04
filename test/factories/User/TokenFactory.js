const crypto = require( 'crypto' );
const config = require( '../../../config' );

const rewire = require( 'rewire' );
const AuthRewire = rewire( '../../../utilities/authentication/token' );
const token_sign = AuthRewire.__get__( 'token_sign' );

const encodeToken = ( data ) => {
    let cipher = crypto.createCipher( 'aes-256-cbc', config.crypto_key );
    let crypted = cipher.update( data, 'utf8', 'hex' );

    crypted += cipher.final( 'hex' );

    return crypted;
};

const decodeToken = async ( data ) => {
    let decipher = await crypto.createDecipher( 'aes-256-cbc', config.crypto_key );
    let decrypted = await decipher.update( data, 'hex', 'utf8' );

    decrypted += decipher.final( 'utf8' );
    return decrypted;
};

const create = async ( data = {} ) => {
    const session = { sid: crypto.randomBytes( 16 ).toString( 'hex' ),
        secret_token: crypto.randomBytes( 16 ).toString( 'hex' ),
        ip: data.ip || '::ffff:127.0.0.1'
    };

    const auth_token = await token_sign( data.client, session );

    return {
        session: session,
        auth_token: encodeToken( auth_token )
    };
};


module.exports = { create };
