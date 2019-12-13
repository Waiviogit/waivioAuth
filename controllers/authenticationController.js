const { signInView, validateAuthTokenView } = require( '../views/authenticationController' );
const render = require( '../concerns/render' );
const { setAuthHeaders } = require( '../utilities/authentication/sessions' );
const Strategies = require( './authStrategies' );

const facebookSignIn = async ( req, res, next ) => {
    const { user, session, error } = await Strategies.facebookStrategy( req, res, next );

    if( error ) return render.unauthorized( res, error );

    setAuthHeaders( res, user, session );
    return render.success( res, signInView( { user } ) );
};

const validateAuthToken = async( req, res ) => {
    setAuthHeaders( res, req.auth.user, req.auth.session );
    return render.success( res, validateAuthTokenView( { user: req.auth.user } ) );
};

module.exports = {
    facebookSignIn,
    validateAuthToken
};
