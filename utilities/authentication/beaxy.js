const _ = require( 'lodash' );
const axios = require( 'axios' );
const config = require( '../../config' );
const crypto = require( 'crypto-js' );
const { UserModel } = require( '../../models' );
const setCookie = require( 'set-cookie-parser' );


const beaxyAuth = async ( data ) => {
    try {
        _.get( data, 'credentials.user' ) ? data.credentials.user = `${config.beaxyPrefix}${data.credentials.user}` : null;
        const dataForReq = _.has( data.credentials, 'token2fa' ) ? _.omit( data.credentials, [ 'user' ] ) : data.credentials;
        const result = await axios.post( `${config.beaxyUrl}/auth/v1${data.key}`, JSON.stringify( dataForReq ),
            { headers: { 'Content-Type': 'application/json' }, withCredentials: true } );
        const { um_session } = setCookie.parse( result, {
            decodeValues: true,
            map: true
        } );
        return { result, um_session };
    } catch ( error ) {
        return { error };
    }
};

const getUserFields = async ( email ) => {
    let name;
    let marker = false;
    while ( !marker ) {
        const num = _.random( 100, 10000000 );
        name = `bxy_${num}`;
        const user = await UserModel.findUserByName( { name } );
        if ( !user ) marker = true;
    }
    return {
        id: crypto.SHA512( `${email}` ).toString(),
        userName: name,
        alias: email.split( '@' )[ 0 ],
        provider: 'beaxy',
        avatar: null,
        postLocales: [ 'en-US' ]
    };
};

const keepAlive = async ( sid, session, res ) => {
    try{
        const result = await axios.get( `${config.beaxyUrl}/keepalive/?sid=${sid}&t=${new Date().valueOf()}`,
            { headers: { 'Content-Type': 'application/json', Cookie: `um_session=${session};` }, withCredentials: true } );

        if ( result.status === 200 ) return res.status( 200 ).json( { result: 'ok' } );
        return { error: { status: 404, message: 'Bad request' } };
    }catch( error ) {
        return { error: { message: error.response.statusText } };
    }
};

module.exports = { beaxyAuth, getUserFields, keepAlive };
