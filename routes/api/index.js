const express = require('express');

const router = express.Router();

router.use('/', require('./users'));
router.use('/', require('./operations'));
router.use('/', require('./hive'));

module.exports = router;
