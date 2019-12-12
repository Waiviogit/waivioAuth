const FacebookStrategy = require( 'passport-facebook-token' );
const { socialAuth } = require( './auth' );

module.exports = async( passport ) => {
    passport.use( 'facebook', new FacebookStrategy( {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET
    },
    ( async ( accessToken, refreshToken, profile, next ) => {
        const provider = profile.provider;
        const avatar_url = profile.photos && profile.photos[ 0 ].value;
        const { id, name } = profile._json;

        await socialAuth( { name, provider, avatar_url, id, next } );
    } ) ) );
};
