const passport = require( 'passport' );
const render = require( '../../concerns/render' );
const Auth = require( '../../utilities/authentication/auth' );

require( '../../utilities/authentication/passport' )( passport );

exports.socialStrategy = async( req, res, next ) => {
    const provider = req.route.path.match( /[a-z].*/ )[ 0 ];
    const userFields = await pickFields( { provider, req, res, next } );

    return await Auth.socialAuth( userFields );
};

const pickFields = async( { provider, req, res, next } ) => {
    return await new Promise( ( resolve ) => {
        passport.authenticate( provider, ( data ) => {
            if( !data || !data.fields ) return render.unauthorized( res, 'Invalid token' );
            const { userName, avatar, alias, locales } = req.body;

            data.fields.userName = userName;
            data.fields.avatar = avatar;
            data.fields.alias = alias ? alias : '';
            data.fields.postLocales = locales ? locales : [ 'en-US' ];

            resolve( data.fields );
        } )( req, res, next );
    } );
};
