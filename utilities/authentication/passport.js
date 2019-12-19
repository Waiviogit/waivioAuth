const FacebookStrategy = require( 'passport-facebook-token' );
const InstagramStrategy = require( 'passport-instagram-token' );
const GoogleStrategy = require( 'passport-google-token' ).Strategy;

module.exports = async( passport ) => {
    const facebookCredentials = { clientID: process.env.FACEBOOK_APP_ID, clientSecret: process.env.FACEBOOK_APP_SECRET };
    const googleCredentials = { clientID: process.env.GOOGLE_APP_ID, clientSecret: process.env.GOOGLE_APP_SECRET };

    passport.use( 'facebook', new FacebookStrategy( facebookCredentials, getSocialFields ) );
    passport.use( 'instagram', new InstagramStrategy( facebookCredentials, getSocialFields ) );
    passport.use( 'google', new GoogleStrategy( googleCredentials, getSocialFields ) );
};


const getSocialFields = async( accessToken, refreshToken, profile, next ) => {
    const provider = profile.provider;
    const avatar = profile.photos && profile.photos[ 0 ].value;
    const { id, name } = profile._json;

    next( { fields: { socialName: name, provider, avatar, id } } );
};
