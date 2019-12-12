const { signInView } = require( '../views/authenticationController' );
const render = require( '../concerns/render' );
const { setAuthHeaders } = require( '../utilities/authentication/sessions' );
const Strategies = require( './authStrategies' );

const facebookSignIn = async ( req, res, next ) => {
    const { user, session, error } = await Strategies.facebookStrategy( req, res, next );

    if( error ) return render.unauthorized( res, error );

    setAuthHeaders( res, user, session );
    return render.success( res, signInView( { user: user } ) );
};

module.exports = {
    facebookSignIn
};
