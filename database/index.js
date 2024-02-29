const mongoose = require('mongoose');
const config = require('../config');

const URI = process.env.MONGO_URI_WAIVIO
  ? process.env.MONGO_URI_WAIVIO
  : `mongodb://${config.db.host}:${config.db.port}/${config.db.database}`;

mongoose.connect(URI)
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
