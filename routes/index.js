const express = require( 'express' );
const router = express.Router();

router.use( '/auth', require( './api' ) );

module.exports = router;
