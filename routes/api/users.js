const router = require('express').Router();
const { AuthenticationController } = require('../../controllers');

const { verifyAuthToken, refreshAccessToken } = require('../../utilities/authentication/validateAuthToken');

router.route('/beaxy').post(AuthenticationController.beaxySignIn);
router.route('/facebook').post(AuthenticationController.socialSignIn);
router.route('/instagram').post(AuthenticationController.socialSignIn);
router.route('/google').post(AuthenticationController.socialSignIn);
router.route('/has_social_account').get(AuthenticationController.hasSocialAccount);
router.route('/validate_auth_token').post(verifyAuthToken, AuthenticationController.validateAuthToken);
router.route('/refresh_auth_token').post(refreshAccessToken, AuthenticationController.refreshAuthToken);
router.route('/beaxy_keepalive').get(AuthenticationController.keepAlive);
router.route('/create_user').post(AuthenticationController.createUser);

module.exports = router;
