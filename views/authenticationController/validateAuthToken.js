module.exports = function( data ) {
    return {
        user: _.omit( data.user, [ 'auth.sessions', 'auth.id' ] )
    };
};
