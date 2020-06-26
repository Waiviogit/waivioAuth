const {
    signUpSocial,
    signInSocial,
    findUserBySocial,
    findUserByName } = require( '../../models/userModel' );
const { signUpRequest } = require( '../helpers/api/authRequest' );

exports.socialAuth = async( { userName, alias, provider, avatar, id, postLocales, nightMode, email } ) => {
    const userBySocial = await findUserBySocial( { id, provider } );

    if( !userBySocial && userName ) {
        const userByName = await findUserByName( { name: userName } );

        if( userByName ) return { message: 'User exist' };
        const { user, message } = await signUpSocial( { userName, alias, avatar, provider, id, postLocales, nightMode, email } );
        if ( user ) {
            signUpRequest( { userName, alias, provider, avatar, postLocales, id, nightMode, email } );
            return{ user };
        }
        return { message };
    }
    if( !userBySocial ) return { message: 'Invalid data fields' };
    return signInSocial( { user_id: userBySocial._id } );
};
