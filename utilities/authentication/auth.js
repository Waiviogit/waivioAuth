const jwt = require( 'jsonwebtoken' );
const { adminModel } = require( '../../database/index' ).models;
const _ = require( 'lodash' );
const render = require( '../../concerns/render' );
const { setAuthHeaders, generateAuthToken } = require( './token' );
const { decodeToken } = require( './encodeDecodeToken' );

const destroySession = async ( admin, session ) => {
    await adminModel.findOneAndUpdate( { _id: admin.id }, { $pull: { sessions: { _id: session.id } } } );
};

const validateAuthToken = async ( req, res, next ) => {
    let session;
    const { headers: { authorization } } = req;

    if( !authorization ) {
        return render.unauthorized( res );
    }
    const decoded_token = await decodeToken( authorization );
    const payload = await jwt.decode( decoded_token );

    if( !payload || !payload.id ) {
        return render.unauthorized( res );
    }
    await adminModel.findById( payload.id ).then(
        async ( doc ) => {
            try{
                session = findSession( { sessions: doc.sessions, sid: payload.sid, remoteAddress: req.connection.remoteAddress, req: req } );
                if( session ) {
                    verifySession( { decoded_token: decoded_token, jwt: jwt, session: session, doc: doc, req: req } );
                    next();
                }else {
                    await destroySession( doc, payload );
                    return render.unauthorized( res );
                }
            } catch( error ) {
                if( error.message === 'jwt expired' ) {
                    await refreshSession( { res: res, req: req, doc: doc, old_session: session } );
                    next();
                }else{
                    return render.unauthorized( res );
                }
            }
        } );

};

const findSession = ( data ) => {
    return _.find( data.sessions, ( hash ) => {
        return hash.sid === data.sid && hash.ip === data.remoteAddress;
    } );
};

const verifySession = ( data ) => {
    data.jwt.verify( data.decoded_token, data.session.secret_token );
    data.req.user = { email: data.doc.email, permissions: [ data.doc.role ], id: data.doc._id, sid: data.session.sid };
};

const refreshSession = async ( data ) => {
    const new_session = generateAuthToken( data.req );

    await destroySession( data.doc, data.old_session );
    await adminModel.findOneAndUpdate( { _id: data.doc.id }, { $push: { sessions: new_session } } );
    await setAuthHeaders( data.res, data.doc, new_session );
    data.req.user = { email: data.doc.email, permissions: [ data.doc.role ], id: data.doc._id, sid: new_session.sid };
};

module.exports = {
    validateAuthToken
};
