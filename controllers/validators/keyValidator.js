const config = require('../../config');

exports.validate = (key) => key === config.apiKey;
