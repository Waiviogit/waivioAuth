const {
    signUpSocial,
    signInSocial,
    findUserBySocial,
    findUserByName } = require( '../../models/userModel' );
const { generateSession } = require( './sessions' );
const { signUpRequest } = require( '../helpers/api/authRequest' );

exports.socialAuth = async( { userName, alias, provider, avatar, id, postLocales, nightMode } ) => {
    const userBySocial = await findUserBySocial( { id, provider } );
    const session = generateSession( );

    if( !userBySocial && userName ) {
        const userByName = await findUserByName( { name: userName } );

        if( userByName ) return { message: 'User exist' };
        const { user, session: existSession, message } = await signUpSocial( { userName, alias, avatar, provider, id, session, postLocales, nightMode } );
        if ( user && existSession ) {
            signUpRequest( { userName, alias, provider, avatar, postLocales, id, session, nightMode } );
            return{ user, session: existSession };
        }
        return { message };
    }
    if( !userBySocial ) return { message: 'Invalid data fields' };
    return await signInSocial( { id, user_id: userBySocial._id, session } );
};
