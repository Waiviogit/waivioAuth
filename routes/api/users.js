const { AuthenticationController } = require( '../../controllers' );

const router = require( 'express' ).Router();
const { validateAuthToken } = require( '../../utilities/authentication/validateAuthToken' );

router.route( '/beaxy' ).post( AuthenticationController.beaxySignIn );
router.route( '/facebook' ).post( AuthenticationController.socialSignIn );
router.route( '/instagram' ).post( AuthenticationController.socialSignIn );
router.route( '/google' ).post( AuthenticationController.socialSignIn );
router.route( '/has_social_account' ).get( AuthenticationController.hasSocialAccount );
router.route( '/validate_auth_token' ).post( validateAuthToken, AuthenticationController.validateAuthToken );
router.route( '/keepalive' ).get( AuthenticationController.keepAlive );

module.exports = router;
