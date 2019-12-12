const { AuthenticationController } = require( '../../controllers' );

const router = require( 'express' ).Router();
const { validateAuthToken } = require( '../../utilities/authentication/validateAuthToken' );


router.route( '/facebook' ).post( AuthenticationController.facebookSignIn );
router.route( '/validate_auth_token' ).post( validateAuthToken, AuthenticationController.validateAuthToken );

module.exports = router;
