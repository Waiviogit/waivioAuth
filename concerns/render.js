const custom = ( res, status, data ) => {
    return res.status( status ).json( data );
};

const error = function ( res, error ) {
    return res.status( 422 ).json( { success: false, error: error } );
};

const success = ( res, data ) => {
    return res.status( 200 ).json( data );
};

const notFound = ( res, data ) => {
    return res.status( 404 ).json( data );
};

const unauthorized = ( res, data ) => {
    return res.status( 401 ).send( {
        success: false,
        message: data || 'No token provided.'
    } );
};

const badGatteway = ( res ) => {
    return res.status( 503 ).send( {
        success: false,
        message: 'Bad request'
    } );
};

module.exports = {
    custom,
    success,
    notFound,
    error,
    unauthorized,
    badGatteway
};
