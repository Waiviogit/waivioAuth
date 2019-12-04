const passport = require( 'passport' );

require( '../../utilities/authentication/passport' )( passport );

const facebookStrategy = async( req, res, next ) => {
    return new Promise( ( resolve, reject ) => {
        passport.authenticate( 'facebook', ( err, account, session ) => {
            if( err || !account ) {
                resolve( { error: 'Invalid credentials' } );
            }
            resolve( { user: account, session: session } );
        } )( req, res, next );
    } );
};


module.exports = facebookStrategy;
