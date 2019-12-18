const jwt = require( 'jsonwebtoken' );
const _ = require( 'lodash' );
const crypto = require( 'crypto-js' );
const config = require( '../config' );
const { User } = require( '../database' ).models;
const { OperationsHelper } = require( '../utilities/helpers' );

const destroyLastSession = async ( { user } ) => {
    if( _.get( user, 'auth.sessions', false ) && user.auth.sessions.length > config.limit_sessions ) {
        await User.updateOne( { _id: user._id }, { $pull: { 'auth.sessions': { _id: user.auth.sessions[ 0 ]._id } } } );
    }
};

const destroySession = async ( { user_id, session } ) => {
    await User.updateOne( { _id: user_id }, { $pull: { 'auth.sessions': { _id: session._id } } } );
};

const findUserBySocial = async( { id, provider } ) => {
    return await User.findOne( { 'auth.provider': provider, 'auth.id': id } );
};

const findUserByName = async( { name } ) => {
    return await User.findOne( { name } );
};

const signUpSocial = async( { userName, pickFields, socialName, provider, avatar, id, session } ) => {
    let metadata, alias;

    if( pickFields ) {
        metadata = { profile: { name: socialName, profile_image: avatar, [ provider ]: generateSocialLink( { provider, id } ) } };
        alias = socialName;
    }
    const user = new User( {
        name: userName,
        json_metadata: metadata ? JSON.stringify( metadata ) : '',
        alias,
        'auth.sessions': [ session ],
        'auth.provider': provider,
        'auth.id': id
    } );

    try{
        await user.save();
        const access_token = prepareToken( { user, session } );
        const { message } = await OperationsHelper.transportAction( userObjectCreate( {
            userId: user.name,
            displayName: alias ? alias : '',
            json_metadata: metadata ? JSON.stringify( metadata ) : '',
            access_token
        } ) );

        if( message ) {
            await User.deleteOne( { _id: user._id } );
            return { message };
        }
    } catch( err ) {
        return { message: err };
    }

    return{ user: user.toObject(), session };
};

const signInSocial = async( { user_id, session } ) => {
    const user = await User.findOneAndUpdate( { _id: user_id }, { $push: { 'auth.sessions': session } }, { new: true } ).lean();

    await destroyLastSession( { user } );
    return{ user: user, session };
};

const generateSocialLink = ( { provider, id } ) => {
    switch ( provider ) {
        case 'facebook' :return `https://www.facebook.com/${id}`;
        case 'instagram' :return `https://www.instagram.com/${id}`;
        default :return null;
    }
};

const userObjectCreate = ( { userId, displayName, json_metadata, access_token } ) => {
    return { params: { id: 'waivio_guest_create', json: { userId, displayName, json_metadata } }, access_token };
};

const prepareToken = ( { user, session } ) => {
    const access_token = jwt.sign( { name: user.name, id: user._id, sid: session.sid }, session.secret_token, { expiresIn: config.session_expiration } );

    return crypto.AES.encrypt( access_token, config.crypto_key ).toString();
};

module.exports = {
    signUpSocial,
    signInSocial,
    findUserByName,
    findUserBySocial,
    destroyLastSession,
    destroySession
};
