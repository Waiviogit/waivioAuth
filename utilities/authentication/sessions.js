const jwt = require( 'jsonwebtoken' );
const { ObjectID } = require( 'bson' );
const crypto = require( 'crypto-js' );
const { uuid } = require( 'uuidv4' );
const config = require( '../../config' );
const { User } = require( '../../database' ).models;
const moment = require( 'moment' );
const { destroySession } = require( '../../models/userModel' );
const TokenSalt = require( './tokenSalt' );
const { encodeToken, decodeToken } = require( './tokenSalt' );

const generateSession = ( ) => {
    return {
        sid: new ObjectID(),
        secret_token: crypto.SHA512( `${uuid()}` ).toString()
    };
};

const removeAuthSession = async ( { user_id, session } ) => {
    await destroySession( { user_id, session } );
};

const setAuthHeaders = ( res, client, session ) => {
    const { access_token, expires_in } = tokenSign( client, session );

    res.setHeader( 'access-token', encodeToken( { access_token } ) );
    res.setHeader( 'expires-in', expires_in );
    res.setHeader( 'waivio-auth', true );
};

const setAuthSession = ( { req, user, session } ) => {
    req.auth = { user, session };
};

const getAuthData = async ( { req } ) => {
    const access_token = req.headers[ 'access-token' ];

    if( !access_token ) return { error: 'Token not found' };
    const decoded_token = await TokenSalt.decodeToken( { access_token } );
    const payload = await jwt.decode( decoded_token );

    if( !payload || !payload.id || !decoded_token ) return { error: 'Invalid token' };
    return { payload, decoded_token };
};

const findSession = ( { sessions, sid } ) => {
    return _.find( sessions, ( hash ) => {
        return hash.sid === sid;
    } );
};

const refreshSession = async ( { req, doc, old_session } ) => {
    const new_session = generateSession( );

    await destroySession( { user_id: doc._id, session: old_session } );
    await User.updateOne( { _id: doc._id }, { $push: { 'auth.sessions': new_session } } );
    setAuthSession( { req, user: doc, session: new_session } );
};

const tokenSign = ( self, token_hash ) => {
    const access_token = jwt.sign(
        { name: self.name, id: self._id, sid: token_hash.sid },
        token_hash.secret_token,
        { expiresIn: config.session_expiration } );

    return { access_token, expires_in: jwt.decode( access_token ).exp };
};

const verifyToken = async ( { decoded_token, session, doc, req, res } ) => {
    try{
        jwt.verify( decoded_token, session.secret_token );
        setAuthSession( { req, user: doc, session } );
        return { result: true };
    }catch( error ) {
        if( error.message === 'jwt expired' && error.expiredAt > moment.utc().subtract( 1, 'hour' ) ) {
            await refreshSession( { res, req, doc, old_session: session } );
            return { result: true };
        }
        return { result: false };
    }
};

const confirmAuthToken = ( { req, user, session, decoded_token, secret_token } ) => {
    try{
        jwt.verify( decoded_token, secret_token );
        setAuthSession( { req, user, session } );
        return { result: true };
    } catch( error ) {
        return { result: false };
    }
};

module.exports = {
    tokenSign,
    generateSession,
    setAuthHeaders,
    decodeToken,
    verifyToken,
    confirmAuthToken,
    findSession,
    getAuthData,
    removeAuthSession
};
