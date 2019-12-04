const { AuthenticationController } = require( '../../controllers' );

const router = require( 'express' ).Router();
// const { validateAuthToken } = require( '../../utilities/authentication/auth' );


router.route( '/facebook' ).post( AuthenticationController.facebookSignIn );

module.exports = router;
