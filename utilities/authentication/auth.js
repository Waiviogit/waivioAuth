const {
    signUpSocial,
    signInSocial,
    findUserBySocial,
    findUserByName } = require( '../../models/userModel' );
const { generateSession } = require( './sessions' );

exports.socialAuth = async( { userName, pickSocialFields, socialName, provider, avatar, id } ) => {
    const userBySocial = await findUserBySocial( { id, provider } );
    const session = generateSession( );

    if( !userBySocial && userName ) {
        const userByName = await findUserByName( { name: userName } );

        if( userByName ) return { message: 'User exist' };
        return await signUpSocial( { userName, pickFields: !!pickSocialFields, socialName, avatar, provider, id, session } );
    }
    if( !userBySocial ) return { message: 'Invalid data fields' };
    return await signInSocial( { id, user_id: userBySocial._id, session } );
};
