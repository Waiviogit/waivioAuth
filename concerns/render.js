const error = function ( res, error ) {
    return res.status( 422 ).json( { success: false, error: error } );
};

const success = ( res, data ) => {
    return res.status( 200 ).json( data );
};

const notFound = ( res, data ) => {
    return res.status( 404 ).json( data );
};

const unauthorized = ( res ) => {
    return res.status( 401 ).send( {
        success: false,
        message: 'No token provided.'
    } );
};

module.exports = {
    success,
    notFound,
    error,
    unauthorized
};
