const FacebookStrategy = require( 'passport-facebook-token' );
const { userModel } = require( '../../database/index' ).models;
const { generateAuthToken } = require( './token' );
const config = require( '../../config/index' );

const destroyLastSession = async ( user ) => {
    if( user.sessions.length >= config.limit_sessions ) {
        await userModel.updateOne( { _id: user.id }, { $pull: { sessions: { _id: user.sessions[ 0 ].id } } } );
    }
};

module.exports = async function( passport ) {
    passport.use( 'facebook', new FacebookStrategy( {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET
    },
    ( async ( accessToken, refreshToken, profile, next ) => {
        const { name } = profile._json;

        await userModel.findOne( { alias: name }, async ( err, user ) => {
            if ( err ) {
                return next( err );
            }
            const query = { alias: name };

            if( !user ) {
                query.name = 'some_name_generation';
            }
            const session = generateAuthToken( );

            await userModel.updateOne( query, { upsert: true }, { $push: { 'auth.$.sessions': session } } );
            await destroyLastSession( user );
            return next( null, user, session );
        } );

    } ) ) );

};
