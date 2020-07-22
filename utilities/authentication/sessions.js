const jwt = require( 'jsonwebtoken' );
const config = require( '../../config' );
const moment = require( 'moment' );


const setAuthHeaders = ( res, client ) => {
    const { access_token, expires_in, refresh_token } = tokenSign( client );

    res.setHeader( 'access-token', access_token );
    res.setHeader( 'refresh-token', refresh_token );
    res.setHeader( 'expires-in', expires_in );
    res.setHeader( 'waivio-auth', true );
};

const getAuthData = async ( { access_token } ) => {
    const payload = await jwt.decode( access_token );

    if( !payload || !payload.id || !access_token ) return { error: 'Invalid token' };
    return { payload, access_token };
};

const findSession = ( { sessions, sid } ) => {
    return _.find( sessions, ( hash ) => {
        return hash.sid === sid;
    } );
};

const tokenSign = ( user ) => {
    const access_token = jwt.sign( { name: user.name, id: user._id }, process.env.ACCESS_KEY, { expiresIn: config.session_expiration } );
    const refresh_token = jwt.sign( { name: user.name, id: user._id }, process.env.REFRESH_KEY, { expiresIn: config.refresh_expiration } );

    return { access_token, expires_in: jwt.decode( access_token ).exp, refresh_token };
};

const verifyToken = ( { access_token, secretKey } ) => {
    try{
        jwt.verify( access_token, secretKey );
        return { result: true };
    }catch( error ) {
        if( error.message === 'jwt expired' && error.expiredAt > moment.utc().subtract( 1, 'minutes' ) ) {
            return { result: true };
        }
        return { result: false };
    }
};

module.exports = {
    tokenSign,
    setAuthHeaders,
    verifyToken,
    findSession,
    getAuthData
};
