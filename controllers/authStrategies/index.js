const _ = require( 'lodash' );
const passport = require( 'passport' );
const render = require( '../../concerns/render' );
const { Auth, Beaxy } = require( '../../utilities/authentication' );


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


exports.beaxyStrategy = async ( params, res ) => {
    const data = {
        key: _.has( params.authData, [ 'password' ] ) ? '' : '/2fa',
        credentials: { ...params.authData }
    };
    const { result, um_session } = await Beaxy.beaxyAuth( { ...data } );
    if ( result.status === 200 ) {
        switch( result.data.response ) {
            case 'SUCCESS' :
                const userFields = await Beaxy.getUserFields( params.authData.user );
                if ( um_session ) {
                    res.setHeader( 'um_session', um_session.value );
                }
                const { user, session, message } = await Auth.socialAuth( userFields );
                return { user, session, beaxyPayload: result.data.payload, message };
            case 'TWO_FA_VERIFICATION_NEEDED' :
                if( _.get( result, 'data.payload.token2fa' ) ) {
                    return render.success( res, result.data );
                }
                return { message: '2fa token not provided' };
            default :
                return { message: result.data.response };
        }
    }
    return render.badGatteway( res );
};
