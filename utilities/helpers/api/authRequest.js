const axios = require( 'axios' );
const config = require( '../../../config' );

const signUpRequest = async ( data ) => {
    try {
        await axios.post( `${config.authUrl}auth/create_user`, data, { headers: { 'api-key': process.env.API_KEY } } );
    }catch( error ) {
        console.error( error.message );
    }
};

module.exports = { signUpRequest };
