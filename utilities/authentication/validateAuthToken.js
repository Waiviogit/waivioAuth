const render = require( '../../concerns/render' );
const { User } = require( '../../database' ).models;
const Sessions = require( './sessions' );

const verifyAuthToken = async ( req, res, next ) => {
    let session;
    const { payload, decoded_token, error } = await Sessions.getAuthData( { req } );

    if ( error ) return render.unauthorized( res, error );

    await User.findById( payload.id ).lean().then(
        async ( doc ) => {
            session = Sessions.findSession( { sessions: doc.auth && doc.auth.sessions, sid: payload.sid } );
            if( session ) {
                const { result } = Sessions.confirmAuthToken( { req, user: doc, session, decoded_token, secret_token: session.secret_token } );

                if( !result ) return render.unauthorized( res );
                return next();

            }
            await Sessions.removeAuthSession( { user_id: doc._id, session: payload } );
            return render.unauthorized( res );
        } );
};

const validateAuthToken = async ( req, res, next ) => {
    let session;
    const { payload, decoded_token, error } = await Sessions.getAuthData( { req } );

    if ( error ) return render.unauthorized( res, error );

    await User.findById( payload.id ).lean().then(
        async ( doc ) => {
            session = Sessions.findSession( { sessions: doc.auth && doc.auth.sessions, sid: payload.sid } );
            if( session ) {
                const { result } = await Sessions.verifyToken( { decoded_token, session, doc, req, res } );

                if( !result ) return render.unauthorized( res );
                return next( );
            }
            await Sessions.removeAuthSession( { user_id: doc._id, session: payload } );
            return render.unauthorized( res );
        } );
};

module.exports = {
    validateAuthToken,
    verifyAuthToken
};
