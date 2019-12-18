const { signInView, validateAuthTokenView, hasSocialView } = require( '../views/authenticationController' );
const render = require( '../concerns/render' );
const { UserModel } = require( '../models' );
const { setAuthHeaders } = require( '../utilities/authentication/sessions' );
const validators = require( './validators' );
const Strategies = require( './authStrategies' );

const socialSignIn = async ( req, res, next ) => {
    const { user, session, error } = await Strategies.socialStrategy( req, res, next );

    if( error ) return render.unauthorized( res, error );

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

module.exports = {
    hasSocialAccount,
    socialSignIn,
    validateAuthToken
};
