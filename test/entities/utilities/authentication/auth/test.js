const { expect, models, sinon, dropDatabase, AuthenticationModule, ObjectID, crypto, OperationsHelper, Requests } = require( '../../../../testHelper' );
const { UserFactory } = require( '../../../../factories' );

describe( 'auth', async () => {

    describe( 'socialAuth', async () => {
        let userName, pickSocialFields, socialName, provider, avatar, id, new_session;

        beforeEach( async () => {
            await dropDatabase();
            id = new ObjectID().toString();
            userName = 'name';
            socialName = 'socialName';
            provider = 'facebook';
            avatar = 'image_url';
            pickSocialFields = false;
            new_session = {
                sid: new ObjectID(),
                secret_token: crypto.SHA512( `${new Date()}` ).toString()
            };
        } );

        afterEach( () => {
            sinon.restore();
        } );

        it( 'check sign up with valid data', async () => {
            sinon.stub( OperationsHelper, 'transportAction' ).returns( Promise.resolve( { success: true } ) );
            const { user, session, message } = await AuthenticationModule.Auth.socialAuth( { userName, pickSocialFields, socialName, provider, avatar, id } );

            expect( user ).to.be.exist;
            expect( session ).to.be.exist;
            expect( message ).to.be.undefined;
            expect( user.auth.sessions.length ).to.be.eq( 1 );
            expect( user.json_metadata ).to.be.eq( '' );
            expect( user.auth.provider ).to.be.eq( provider );
            expect( user.auth.sessions[ 0 ].sid ).to.be.eql( session.sid.toString() );
            expect( user.auth.sessions[ 0 ].secret_token ).to.be.eq( session.secret_token );
            expect( user.name ).to.be.eq( userName );
            expect( user.alias ).to.be.undefined ;
        } );

        it( 'check sign up with true pickSocialFields', async () => {
            sinon.stub( OperationsHelper, 'transportAction' ).returns( Promise.resolve( { success: true } ) );
            sinon.stub( Requests, 'uploadAvatar' ).returns( Promise.resolve( 'image_url' ) );
            pickSocialFields = true;
            const { user, session, message } = await AuthenticationModule.Auth.socialAuth( { userName, pickSocialFields, socialName, provider, avatar, id } );
            const metadata = { profile: {
                name: socialName,
                profile_image: 'image_url',
                facebook: id
            } };

            expect( user ).to.be.exist;
            expect( session ).to.be.exist;
            expect( message ).to.be.undefined;
            expect( user.auth.sessions.length ).to.be.eq( 1 );
            expect( user.json_metadata ).to.be.eql( JSON.stringify( metadata ) );
            expect( user.auth.provider ).to.be.eq( provider );
            expect( user.auth.sessions[ 0 ].sid ).to.be.eql( session.sid.toString() );
            expect( user.auth.sessions[ 0 ].secret_token ).to.be.eq( session.secret_token );
            expect( user.name ).to.be.eq( userName );
            expect( user.alias ).to.be.eq( socialName ) ;
        } );

        it( 'check sign up with exist user', async () => {
            sinon.stub( OperationsHelper, 'transportAction' ).returns( Promise.resolve( { success: true } ) );
            await UserFactory.create( { name: userName, auth: { sessions: [ ] } } );
            const { user, session, message } = await AuthenticationModule.Auth.socialAuth( { userName, pickSocialFields, socialName, provider, avatar, id } );

            expect( user ).to.be.undefined;
            expect( session ).to.be.undefined;
            expect( message ).to.be.exist;
            expect( message ).to.be.eq( 'User exist' );
        } );

        it( 'check sign up without user name', async () => {
            sinon.stub( OperationsHelper, 'transportAction' ).returns( Promise.resolve( { success: true } ) );
            const { user, session, message } = await AuthenticationModule.Auth.socialAuth( { userName: null, pickSocialFields, socialName, provider, avatar, id } );

            expect( user ).to.be.undefined;
            expect( session ).to.be.undefined;
            expect( message ).to.be.exist;
            expect( message ).to.be.eq( 'Invalid data fields' );
        } );

        it( 'check sign in with valid data', async () => {
            await UserFactory.create( { name: userName, auth: { provider: 'facebook', id: id, sessions: [ ] } } );
            const { user, session, message } = await AuthenticationModule.Auth.socialAuth( { userName, pickSocialFields, socialName, provider, avatar, id } );

            expect( user ).to.be.exist;
            expect( session ).to.be.exist;
            expect( message ).to.be.undefined;
            expect( user.auth.sessions.length ).to.be.eq( 1 );
        } );

        it( 'check sign in with invalid provider', async () => {
            await UserFactory.create( { name: userName, auth: { provider: 'aaaa', id: id, sessions: [ ] } } );
            const { user, session, message } = await AuthenticationModule.Auth.socialAuth( { userName, pickSocialFields, socialName, provider, avatar, id } );

            expect( user ).to.be.undefined;
            expect( session ).to.be.undefined;
            expect( message ).to.be.exist;
            expect( message ).to.be.eq( 'User exist' );
        } );
    } );

} );
