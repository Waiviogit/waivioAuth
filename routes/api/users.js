const { AuthenticationController } = require( '../../controllers' );

const router = require( 'express' ).Router();
const { validateAuthToken } = require( '../../utilities/authentication/validateAuthToken' );


router.route( '/facebook', '/instagram', '/google' ).post( AuthenticationController.socialSignIn );
router.route( '/has_social_account' ).get( AuthenticationController.hasSocialAccount );
router.route( '/validate_auth_token' ).post( validateAuthToken, AuthenticationController.validateAuthToken );

module.exports = router;
