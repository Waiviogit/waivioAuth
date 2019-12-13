const _ = require( 'lodash' );

module.exports = function( data ) {
    return {
        user: _.omit( data.user, [ 'auth' ] )
    };
};
