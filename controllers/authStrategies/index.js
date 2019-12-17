const passport = require( 'passport' );
const render = require( '../../concerns/render' );
const Auth = require( '../../utilities/authentication/auth' );

require( '../../utilities/authentication/passport' )( passport );

exports.socialStrategy = async( req, res, next ) => {
    const { userName, pickSocialFields } = req.body;
    const provider = req.route.path.match( /[a-z].*/ )[ 0 ];
    const socialFields = await pickSocialData( { passport, provider, req, res, next } );

    return await Auth.socialAuth( Object.assign( socialFields, { userName, pickSocialFields } ) );
};

const pickSocialData = async( { passport, provider, req, res, next } ) => {
    return await new Promise( ( resolve ) => {
        passport.authenticate( provider, ( { fields } ) => {
            if( !fields ) return render.unauthorized( res, 'Invalid token' );
            resolve( fields );
        } )( req, res, next );
    } );
};
