const axios = require( 'axios' );

const sendRequest = async( { path, type, params } ) => {
    return await axios( { baseURL: path, method: type, data: params } )
        .then( ( response ) => getResponse( { response } ) )
        .catch( ( error ) => getResponse( { response: error.response } ) );
};

const getResponse = ( { response } ) => {
    const status = response && response.status || 500;
    const { error, json } = response && response.data || {};

    return { status, error, json };
};


module.exports = {
    sendRequest
};

