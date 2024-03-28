const mongoose = require('mongoose');
const config = require('../config');

mongoose.connect(config.mongoConnectionString)
  .then(() => console.log('connection successful!'))
  .catch((error) => console.error(error));

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

mongoose.Promise = global.Promise;

module.exports = {
  Mongoose: mongoose,
  models: {
    User: require('./schemas/UserSchema'),
  },
};
