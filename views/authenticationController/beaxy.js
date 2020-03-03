module.exports = function( { user, beaxyPayload } ) {
    return {
        user: _.omit( user, [ 'auth' ] ),
        payload: beaxyPayload
    };
};
