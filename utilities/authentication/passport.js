const FacebookStrategy = require( 'passport-facebook-token' );
const InstagramStrategy = require( 'passport-instagram-token' );
const GoogleStrategy = require( 'passport-google-token' ).Strategy;

module.exports = async( passport ) => {
    const credentials = { clientID: process.env.APP_ID, clientSecret: process.env.APP_SECRET };

    passport.use( 'facebook', new FacebookStrategy( credentials, getSocialFields ) );
    passport.use( 'instagram', new InstagramStrategy( credentials, getSocialFields ) );
    passport.use( 'google', new GoogleStrategy( credentials, getSocialFields ) );
};


const getSocialFields = async( accessToken, refreshToken, profile, next ) => {
    const provider = profile.provider;
    const avatar = profile.photos && profile.photos[ 0 ].value;
    const { id, name } = profile._json;

    next( { fields: { socialName: name, provider, avatar, id } } );
};
