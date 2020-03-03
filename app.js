const express = require( 'express' );
const cors = require( 'cors' );
const app = express();

global._ = require( 'lodash' );
app.use( cors( { exposedHeaders: [ 'access-token', 'expires-in', 'waivio-auth', 'um_session' ] } ) );
require( './enviroment.js' )( app, express );
require( './auth.js' )( app );
const routes = require( './routes' );

app.use( '/', routes );

module.exports = app;
