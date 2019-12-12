const jwt = require( 'jsonwebtoken' );
const _ = require( 'lodash' );
const render = require( '../../concerns/render' );
const { User } = require( '../../database' ).models;
const { setAuthHeaders, generateSession } = require( './sessions' );
const { decodeToken } = require( './tokenSalt' );
const { destroySession } = require( '../../models/userModel' );

const validateAuthToken = async ( req, res, next ) => {
    let session;
    const { headers: { authorization } } = req;

    if( !authorization ) return unauthorizedError( res );
    const decoded_token = await decodeToken( authorization );
    const payload = await jwt.decode( decoded_token );

    if( !payload || !payload.id ) return unauthorizedError( res );

    await User.findById( payload.id ).then(
        async ( doc ) => {
            try{
                session = findSession( { sessions: doc.sessions, sid: payload.sid } );
                if( session ) {
                    verifySession( { decoded_token, jwt, session, doc, req } );
                    next();
                }else {
                    await destroySession( { user_id: doc._id, session: payload } );
                    return unauthorizedError( res );
                }
            } catch( error ) {
                if( error.message === 'jwt expired' ) {
                    await refreshSession( { res, req, doc, old_session: session } );
                    next();
                }else return unauthorizedError( res );
            }
        } );

};

const findSession = ( { sessions, sid } ) => {
    return _.find( sessions, ( hash ) => {
        return hash.sid === sid;
    } );
};

const verifySession = ( { decoded_token, session, doc, req } ) => {
    jwt.verify( decoded_token, session.secret_token );
    req.user = { name: doc.name, id: doc._id, sid: session.sid };
};

const refreshSession = async ( { res, req, doc, old_session } ) => {
    const new_session = generateSession( req );

    await destroySession( doc, old_session );
    await User.findOneAndUpdate( { _id: doc.id }, { $push: { sessions: new_session } } );
    await setAuthHeaders( res, doc, new_session );
    data.req.user = { name: doc.name, id: doc._id, sid: new_session.sid };
};

const unauthorizedError = ( res ) => {
    return render.unauthorized( res );
};

module.exports = {
    validateAuthToken
};
