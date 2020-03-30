const { signInView, validateAuthTokenView, hasSocialView, beaxySignInView } = require( '../views/authenticationController' );
const render = require( '../concerns/render' );
const { UserModel } = require( '../models' );
const { setAuthHeaders } = require( '../utilities/authentication/sessions' );
const validators = require( './validators' );
const Strategies = require( './authStrategies' );
const Beaxy = require( '../utilities/authentication/beaxy' );

const socialSignIn = async ( req, res, next ) => {
    const { validation_error } = validators.validate(
        Object.assign( req.body, { nightMode: req.headers.nightmode } ), validators.authentication.socialAuthShcema );

    if ( validation_error ) return render.error( res, validation_error );
    const { user, session, message } = await Strategies.socialStrategy( req, res, next );

    if( message ) return render.unauthorized( res, message );

    setAuthHeaders( res, user, session );
    return render.success( res, signInView( { user } ) );
};

const validateAuthToken = async( req, res ) => {
    setAuthHeaders( res, req.auth.user, req.auth.session );
    return render.success( res, validateAuthTokenView( { user: req.auth.user } ) );
};

const hasSocialAccount = async ( req, res ) => {
    const { params, validation_error } = validators.validate( req.query, validators.authentication.hasSocialShcema );

    if ( validation_error ) return render.error( res, validation_error );
    const result = await UserModel.findUserBySocial( params );

    return render.success( res, hasSocialView( { result: !!result } ) );
};

const beaxySignIn = async ( req, res ) => {
    const { validation_error, params } = validators.validate(
        Object.assign( req.body, { nightMode: req.headers.nightmode } ), validators.authentication.socialBeaxySchema );

    if ( validation_error ) return render.error( res, validation_error );
    const { user, session, message, beaxyPayload } = await Strategies.beaxyStrategy( params, res );

    if( message ) return render.unauthorized( res, message );
    if( !session || !user )return;
    setAuthHeaders( res, user, session );
    return render.success( res, beaxySignInView( { user, beaxyPayload } ) );
};

const keepAlive = async ( req, res, next ) => {
    if ( !req.query.sid || !req.headers.um_session ) return render.error( res, 'sid and um_session is required' );
    const { error } = await Beaxy.keepAlive( req.query.sid, req.headers.um_session, res );
    if ( error ) return render.notFound( res, error );
    next();
};

const createUser = async ( req, res ) => {
    if ( !validators.keyValidator.validate( req.headers[ 'api-key' ] ) ) return render.unauthorized( res );

    const { validation_error, params } = validators.validate( req.body, validators.authentication.createUserSchema );

    if ( validation_error ) return render.error( res, validation_error );
    const { user, session, message } = await UserModel.signUpSocial( params );

    if( message ) return render.error( res, message );
    if( !session || !user )return;
    return render.success( res, { result: true } );
};

module.exports = {
    hasSocialAccount,
    socialSignIn,
    validateAuthToken,
    beaxySignIn,
    keepAlive,
    createUser
};
