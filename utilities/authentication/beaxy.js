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
        const result = await axios( {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            url: `${config.beaxyUrl}${data.key}`,
            data: JSON.stringify( dataForReq )
        }, { withCredentials: true } );
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
        const num = Math.random();
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

module.exports = { beaxyAuth, getUserFields };
