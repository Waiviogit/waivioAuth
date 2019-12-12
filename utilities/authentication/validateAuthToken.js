const jwt = require( 'jsonwebtoken' );
const _ = require( 'lodash' );
const render = require( '../../concerns/render' );
const { User } = require( '../../database' ).models;
const { generateSession } = require( './sessions' );
const { decodeToken } = require( './tokenSalt' );
const { destroySession } = require( '../../models/userModel' );

const validateAuthToken = async ( req, res, next ) => {
    let session;
    const access_token = req.headers[ 'access-token' ];

    if( !access_token ) return unauthorizedError( res );
    const decoded_token = await decodeToken( { access_token } );
    const payload = await jwt.decode( decoded_token );

    if( !payload || !payload.id ) return unauthorizedError( res );

    await User.findById( payload.id ).then(
        async ( doc ) => {
            session = findSession( { sessions: doc.auth.sessions, sid: payload.sid } );
            if( session ) next( await verifySession( { decoded_token, jwt, session, doc, req, res } ) );
            else await destroySession( { user_id: doc._id, session: payload } );
            return unauthorizedError( res );
        } );

};

const findSession = ( { sessions, sid } ) => {
    return _.find( sessions, ( hash ) => {
        return hash.sid === sid;
    } );
};

const verifySession = async ( { decoded_token, session, doc, req, res } ) => {
    try{
        jwt.verify( decoded_token, session.secret_token );
        req.auth = { user: doc, session: session };
    }catch( error ) {
        if( error.message === 'jwt expired' ) {
            await refreshSession( { res, req, doc, old_session: session } );
        }
    }
};

const refreshSession = async ( { req, doc, old_session } ) => {
    const new_session = generateSession( );

    await destroySession( { user_id: doc._id, session: old_session } );
    await User.findOneAndUpdate( { _id: doc.id }, { $push: { sessions: new_session } } );
    req.auth = { user: doc, session: new_session };
};

const unauthorizedError = ( res ) => {
    return render.unauthorized( res );
};

module.exports = {
    validateAuthToken
};
