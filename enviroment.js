const logger = require( 'morgan' );
const cookieParser = require( 'cookie-parser' );
const swaggerUi = require( 'swagger-ui-express' );
const swaggerDocument = require( './swagger/swagger.json' );
const Sentry = require( '@sentry/node' );


module.exports = function( app, express ) {
    if( process.env.NODE_ENV === 'staging' ) {
        Sentry.init( { dsn: 'https://d0c3688cfc0543d8a6246a1865a8b44b@sentry.io/1860908' } );
        app.use( Sentry.Handlers.requestHandler() );
        app.use( Sentry.Handlers.errorHandler( {
            shouldHandleError( error ) {
                // Capture all 404 and 500 errors
                if ( error.status === 404 || error.status === 500 ) return true;
                return false;
            }
        } ) );
    }
    app.use( cookieParser() );
    app.use( express.json() );
    app.use( logger( 'dev' ) );
    app.use( express.urlencoded( { extended: false } ) );
    app.use( '/auth-service/docs', swaggerUi.serve, swaggerUi.setup( swaggerDocument ) );

    // error handler
    app.use( ( err, req, res, next ) => {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get( 'env' ) === 'development' ? err : {};

        // render the error page
        res.status( err.status || 500 ).send( 'Bad request' );
        // res.render( 'error' );
    } );
};
