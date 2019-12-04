const express = require( 'express' );
const router = express.Router();

router.use( '/auth', require( './users' ) );

module.exports = router;
