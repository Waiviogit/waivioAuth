const crypto = require( 'crypto-js' );
const config = require( '../../../config' );
const { ObjectID } = require( '../../testHelper' );

const rewire = require( 'rewire' );
const AuthRewire = rewire( '../../../utilities/authentication/sessions' );
const token_sign = AuthRewire.__get__( 'token_sign' );

const encodeToken = ( { access_token } ) => {
    return crypto.AES.encrypt( access_token, config.crypto_key ).toString();
};

const decodeToken = async ( { access_token } ) => {
    return crypto.AES.decrypt( access_token, config.crypto_key ).toString( crypto.enc.Utf8 );
};

const create = async ( data = {} ) => {
    const session = {
        sid: new ObjectID(),
        secret_token: crypto.SHA512( `${new Date()}` ).toString()
    };

    const auth_token = await token_sign( data.client, session );

    return {
        session: session,
        auth_token: encodeToken( auth_token )
    };
};


module.exports = { create, decodeToken, encodeToken };
