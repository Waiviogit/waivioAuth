const { User } = require( '../database' ).models;
const config = require( '../config' );
const _ = require( 'lodash' );

const destroyLastSession = async ( { user } ) => {
    if( _.get( user, 'auth.sessions', false ) && user.auth.sessions.length >= config.limit_sessions ) {
        await User.updateOne( { _id: user._id }, { $pull: { 'auth.sessions': { _id: user.auth.sessions[ 0 ]._id } } } );
    }
};

const destroySession = async ( { user_id, session } ) => {
    await User.updateOne( { _id: user_id }, { $pull: { 'auth.sessions': { _id: session._id } } } );
};

const findOrCreateSocial = async( { query, session, metadata } ) => {
    const user = await User.findOne( { query } );
    const userMetadata = user ? getUserMetadata( { user } ) : {};

    if( !userMetadata.profile ) userMetadata.profile = {};

    _.assign( userMetadata.profile, metadata );

    return await User.findOneAndUpdate( query,
        {
            $set: { query, json_metadata: JSON.stringify( userMetadata ) },
            $push: { 'auth.sessions': session }
        },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
};

const getUserMetadata = ( { user } ) => {
    try{
        return user.json_metadata && user.json_metadata !== '' ? JSON.parse( user.json_metadata ) : {};
    } catch( error ) {
        return {};
    }
};

module.exports = {
    findOrCreateSocial,
    destroyLastSession,
    destroySession
};
