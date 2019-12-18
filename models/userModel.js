const { User } = require( '../database' ).models;
const { OperationsHelper } = require( '../utilities/helpers' );
const config = require( '../config' );
const _ = require( 'lodash' );

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

    const { error } = await OperationsHelper.transportAction( { params: userObjectCreate( {
        userId: user.name,
        diplayName: alias,
        jsonMetadata: metadata ? JSON.stringify( metadata ) : ''
    } ) } );

    if( error ) return { error };

    try{
        await user.save();
    } catch( err ) {
        return { error: err };
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

const userObjectCreate = ( { userId, displayName, jsonMetadata } ) => {
    return { id: 'waivio_guest_create', json: { userId, displayName, jsonMetadata } };
};

module.exports = {
    signUpSocial,
    signInSocial,
    findUserByName,
    findUserBySocial,
    destroyLastSession,
    destroySession
};
