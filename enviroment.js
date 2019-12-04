const logger = require( 'morgan' );
const cookieParser = require( 'cookie-parser' );
// const swaggerUi = require( 'swagger-ui-express' );
// const swaggerDocument = require( './swagger/swagger.json' );

module.exports = function( app, express ) {
    app.use( cookieParser() );
    app.use( express.json() );
    app.use( logger( 'dev' ) );
    app.use( express.urlencoded( { extended: false } ) );
    // app.use( '/docs', swaggerUi.serve, swaggerUi.setup( swaggerDocument ) );

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
