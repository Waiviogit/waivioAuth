const express = require( 'express' );
const cors = require( 'cors' );
const app = express();

app.use( cors( { exposedHeaders: [ 'access-token', 'expires-in', 'waivio-auth' ] } ) );

require( './enviroment.js' )( app, express );
require( './auth.js' )( app );
const routes = require( './routes' );

app.use( '/', routes );

module.exports = app;
