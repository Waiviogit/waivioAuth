const axios = require( 'axios' );

const sendRequest = async( { path, type, params, access_token } ) => {
    return await axios( { baseURL: path, method: type, data: params, headers: { 'access-token': access_token } } )
        .then( ( response ) => getResponse( { response } ) )
        .catch( ( error ) => getResponse( { response: error.response } ) );
};

const getResponse = ( { response } ) => {
    const status = response && response.status || 500;
    const { message, json } = response && response.data || {};

    return { status, message, json };
};


module.exports = {
    sendRequest
};

