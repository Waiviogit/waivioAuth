const axios = require( 'axios' );
const config = require( '../../../config' );

const signUpRequest = async ( data ) => {
    try {
        await axios.post( `${config.authUrl}auth/${data.provider}`, data );
    }catch( error ) {
        console.error( error );
    }
};

module.exports = { signUpRequest };
