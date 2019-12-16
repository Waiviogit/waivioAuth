const { OperationsController } = require( '../../controllers' );

const router = require( 'express' ).Router();
const { verifyAuthToken } = require( '../../utilities/authentication/validateAuthToken' );

router.route( '/guest_operations' ).post( verifyAuthToken, OperationsController.transportAction );

module.exports = router;
