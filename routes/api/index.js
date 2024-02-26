const express = require('express');

const router = express.Router();

router.use('/', require('./users'));
router.use('/', require('./operations'));

module.exports = router;
