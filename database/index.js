const config = require( '../config' );
const mongoose = require( 'mongoose' );


const URI = process.env.MONGO_URI_WAIVIO
    ? process.env.MONGO_URI_WAIVIO
    : `mongodb://${config.db.host}:${config.db.port}/${config.db.database}`;

mongoose.connect( URI, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true, useUnifiedTopology: true } )
    .then( () => console.log( 'connection successful!' ) )
    .catch( ( error ) => console.error( error ) );

mongoose.connection.on( 'error', console.error.bind( console, 'MongoDB connection error:' ) );

mongoose.Promise = global.Promise;

module.exports = {
    Mongoose: mongoose,
    models: {
        User: require( './schemas/UserSchema' )
    }
};
