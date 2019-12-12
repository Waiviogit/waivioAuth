const { User } = require( '../../database/index' ).models;
const { destroyLastSession, findOrCreateSocial } = require( '../../models/userModel' );
const { generateSession } = require( './sessions' );

exports.socialAuth = async( { name, provider, avatar_url, id, next } ) => {
    let findUser;

    try{
        findUser = await User.findOne( { alias: name } );
    } catch( error ) {
        return next( error );
    }
    const query = { alias: name, 'auth.provider': provider, 'auth.id': id };
    const metadata = { profile_image: avatar_url };

    if( !findUser ) query.name = `${provider}|${id}`;
    const session = generateSession( );
    const user = await findOrCreateSocial( { query, session, metadata } );

    await destroyLastSession( { user } );
    return next( null, user, session );
};
