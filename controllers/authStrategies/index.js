const passport = require( 'passport' );

require( '../../utilities/authentication/passport' )( passport );

exports.facebookStrategy = async( req, res, next ) => {
    return new Promise( ( resolve ) => {
        passport.authenticate( 'facebook', ( err, account, session ) => {
            if( err || !account ) resolve( { error: 'Invalid credentials or token' } );
            resolve( { user: account, session: session } );
        } )( req, res, next );
    } );
};
