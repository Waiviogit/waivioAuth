const jwt = require( 'jsonwebtoken' );
const crypto = require( 'crypto-js' );
const config = require( '../config' );
const Requests = require( '../utilities/helpers/api/requests' );
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
    return User.findOne( { 'auth.provider': provider, 'auth.id': id } );
};

const findUserById = async ( id ) => {
    try{
        return { user: await User.findOne( { _id: id } ).lean() };
    }catch ( error ) {
        return { error };
    }
};

const findUserByName = async( { name } ) => {
    return User.findOne( { name } );
};

const signUpSocial = async( { userName, alias, provider, avatar, id, session, postLocales, nightMode, email } ) => {
    avatar ? avatar = await Requests.uploadAvatar( { userName, imageUrl: avatar } ) : avatar = 'https://waivio.nyc3.digitaloceanspaces.com/1591120767_bc441d85-3992-486c-8254-a09341a23003';

    const metadata = JSON.stringify( { profile: { name: alias, profile_image: avatar, email } } );
    const user = new User( {
        name: userName,
        posting_json_metadata: metadata,
        json_metadata: metadata,
        alias,
        'auth.sessions': [ session ],
        'auth.provider': provider,
        'auth.id': id
    } );

    user.user_metadata.settings.postLocales = postLocales;
    user.user_metadata.settings.nightmode = nightMode;
    user.user_metadata.settings.votingPower = false;

    try{
        await user.save();
        const access_token = prepareToken( { user, session } );
        const { message } = await OperationsHelper.transportAction( userObjectCreate( {
            userId: user.name,
            displayName: alias ? alias : '',
            posting_json_metadata: metadata,
            json_metadata: metadata,
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
    const user = await User.findOneAndUpdate( { _id: user_id }, { $push: { 'auth.sessions': session } }, { new: true, select: '+user_metadata' } ).lean();

    await destroyLastSession( { user } );
    return{ user: user, session };
};

const userObjectCreate = ( { userId, displayName, posting_json_metadata, access_token, json_metadata } ) => {
    return { params: { id: 'waivio_guest_create', json: { userId, displayName, posting_json_metadata, json_metadata } }, access_token };
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
    destroySession,
    findUserById
};
