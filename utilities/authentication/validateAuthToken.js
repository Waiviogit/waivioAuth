const render = require( '../../concerns/render' );
const { UserModel } = require( '../../models' );
const Sessions = require( './sessions' );
const ObjectId = require( 'mongodb' ).ObjectID;

const verifyAuthToken = async ( req, res, next ) => {
    let session;
    const { payload, decoded_token, error } = await Sessions.getAuthData( { req } );

    if ( error ) return render.unauthorized( res, error );

    const { user } = await UserModel.findUserById( ObjectId( payload.id ) );
    if( !user ) return render.unauthorized( res, 'User not exist' );
    session = Sessions.findSession( { sessions: user && user.auth && user.auth.sessions, sid: payload.sid } );
    if( session ) {
        const { result } = Sessions.confirmAuthToken( { req, user, session, decoded_token, secret_token: session.secret_token } );
        if( !result ) return render.unauthorized( res );
        return next();
    }
    await Sessions.removeAuthSession( { user_id: user._id, session: payload } );
    return render.unauthorized( res );
};

const validateAuthToken = async ( req, res, next ) => {
    let session;
    const { payload, decoded_token, error } = await Sessions.getAuthData( { req } );

    if ( error ) return render.unauthorized( res, error );

    const { user } = await UserModel.findUserById( ObjectId( payload.id ) );
    if( !user ) return render.unauthorized( res, 'User not exist' );
    session = Sessions.findSession( { sessions: user.auth && user.auth.sessions, sid: payload.sid } );
    if( session ) {
        const { result } = await Sessions.verifyToken( { decoded_token, session, doc: user, req, res } );

        if( !result ) return render.unauthorized( res );
        return next();
    }
    if( user._id ) await Sessions.removeAuthSession( { user_id: user._id, session: payload } );
    return render.unauthorized( res );
};

module.exports = {
    validateAuthToken,
    verifyAuthToken
};
