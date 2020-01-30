const passport = require( 'passport' );
const render = require( '../../concerns/render' );
const Auth = require( '../../utilities/authentication/auth' );

require( '../../utilities/authentication/passport' )( passport );

const updateUserData = ( avatar, alias, postLocales, socialFields ) => {
    socialFields.avatar = avatar;
    socialFields.socialName = alias ? alias : '';
    socialFields.postLocales = postLocales ? postLocales : [ 'en-US' ];

    return socialFields;
};

exports.socialStrategy = async( req, res, next ) => {
    const { userName, avatar, alias, locales } = req.body;
    const provider = req.route.path.match( /[a-z].*/ )[ 0 ];
    const socialFields = await pickSocialData( { passport, provider, req, res, next } );

    return await Auth.socialAuth(
        Object.assign( updateUserData( avatar, alias, locales, socialFields ), { userName } ) );
};

const pickSocialData = async( { passport, provider, req, res, next } ) => {
    return await new Promise( ( resolve ) => {
        passport.authenticate( provider, ( data ) => {
            if( !data || !data.fields ) return render.unauthorized( res, 'Invalid token' );
            resolve( data.fields );
        } )( req, res, next );
    } );
};
