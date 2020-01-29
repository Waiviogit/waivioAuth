const { expect, models, dropDatabase, UserModel, ObjectID, crypto, sinon, OperationsHelper, Requests } = require( '../../../testHelper' );
const { UserFactory } = require( '../../../factories' );

const rewire = require( 'rewire' );
const UserModelRewire = rewire( '../../../../models/userModel' );
const generateSocialLink = UserModelRewire.__get__( 'generateSocialLink' );

describe( 'userModel', async () => {
    describe( 'signUpSocial', async () => {
        let userName, socialName, provider, avatar, id, session;

        beforeEach( async() => {
            await dropDatabase();
            id = new ObjectID().toString();
            userName = 'name';
            socialName = 'socialName';
            avatar = 'image_url';
            provider = 'facebook';
            session = {
                sid: new ObjectID(),
                secret_token: crypto.SHA512( `${new Date()}` ).toString()
            };
        } );

        afterEach( () => {
            sinon.restore();
        } );

        it( 'should be successfully sign up without metadata', async() => {
            sinon.stub( OperationsHelper, 'transportAction' ).returns( Promise.resolve( { success: true } ) );
            sinon.stub( Requests, 'uploadAvatar' ).returns( Promise.resolve( null ) );
            const result = await UserModel.signUpSocial( { userName, socialName, provider, avatar, id, session } );
            const user = await models.User.findOne( { name: userName } );

            expect( result ).to.have.all.keys( 'user', 'session' );
            expect( user.auth.sessions.length ).to.be.eq( 1 );
            expect( user.auth.provider ).to.be.eq( provider );
            expect( user.auth.sessions[ 0 ].sid ).to.be.eql( session.sid.toString() );
            expect( user.auth.sessions[ 0 ].secret_token ).to.be.eq( session.secret_token );
            expect( user.name ).to.be.eq( userName );
            expect( user.alias ).to.be.eq( socialName ) ;
        } );

        it( 'should be successfully sign up with metadata', async() => {
            sinon.stub( OperationsHelper, 'transportAction' ).returns( Promise.resolve( { success: true } ) );
            sinon.stub( Requests, 'uploadAvatar' ).returns( Promise.resolve( 'image_url' ) );
            pickFields = true;
            const result = await UserModel.signUpSocial( { userName, socialName, provider, avatar, id, session } );
            const user = await models.User.findOne( { name: userName } );
            const metadata = { profile: {
                name: socialName,
                profile_image: 'image_url',
                facebook: id
            } };

            expect( result ).to.have.all.keys( 'user', 'session' );
            expect( user.auth.sessions.length ).to.be.eq( 1 );
            expect( user.json_metadata ).to.be.eql( JSON.stringify( metadata ) );
            expect( user.auth.provider ).to.be.eq( provider );
            expect( user.auth.sessions[ 0 ].sid ).to.be.eql( session.sid.toString() );
            expect( user.auth.sessions[ 0 ].secret_token ).to.be.eq( session.secret_token );
            expect( user.name ).to.be.eq( userName );
            expect( user.alias ).to.be.eq( socialName ) ;
        } );

        it( 'should be successfully sign up without avatar', async() => {
            sinon.stub( OperationsHelper, 'transportAction' ).returns( Promise.resolve( { success: true } ) );
            sinon.stub( Requests, 'uploadAvatar' ).returns( Promise.resolve( null ) );
            pickFields = true;
            const result = await UserModel.signUpSocial( { userName, socialName, provider, avatar: null, id, session } );
            const user = await models.User.findOne( { name: userName } );
            const metadata = { profile: {
                name: socialName,
                profile_image: null,
                facebook: id
            } };

            expect( result ).to.have.all.keys( 'user', 'session' );
            expect( user.auth.sessions.length ).to.be.eq( 1 );
            expect( user.json_metadata ).to.be.deep.eq( JSON.stringify( metadata ) );
            expect( user.auth.provider ).to.be.eq( provider );
            expect( user.auth.sessions[ 0 ].sid ).to.be.eql( session.sid.toString() );
            expect( user.auth.sessions[ 0 ].secret_token ).to.be.eq( session.secret_token );
            expect( user.name ).to.be.eq( userName );
            expect( user.alias ).to.be.eq( socialName ) ;
        } );

        it( 'should return error', async() => {
            sinon.stub( OperationsHelper, 'transportAction' ).returns( Promise.resolve( { success: true } ) );
            sinon.stub( Requests, 'uploadAvatar' ).returns( Promise.resolve( null ) );
            const { message } = await UserModel.signUpSocial( { socialName, provider, avatar, id, session } );

            expect( message ).to.be.exist;
        } );

        it( 'should return error with object bot error', async() => {
            sinon.stub( OperationsHelper, 'transportAction' ).returns( Promise.resolve( { message: 'Some error' } ) );
            sinon.stub( Requests, 'uploadAvatar' ).returns( Promise.resolve( null ) );
            const { message } = await UserModel.signUpSocial( { userName, socialName, provider, avatar, id, session } );

            expect( message ).to.be.eq( 'Some error' );
        } );
    } );
    describe( 'signInSocial', async () => {
        let user, session;

        beforeEach( async() => {
            await dropDatabase();
            session = {
                sid: new ObjectID(),
                secret_token: crypto.SHA512( `${new Date()}` ).toString()
            };
            user = await UserFactory.create( { auth: { sessions: [ ] } } );
        } );

        it( 'should be successfully return sign in data', async() => {
            const result = await UserModel.signInSocial( { user_id: user._id, session } );
            const findUser = await models.User.findOne( { _id: user._id } );

            expect( result ).to.have.all.keys( 'user', 'session' );
            expect( findUser.auth.sessions.length ).to.be.eq( 1 );
        } );

        it( 'should many times sign in', async() => {
            for( let i = 0;i < 6;i++ ) {
                await UserModel.signInSocial( { user_id: user._id, session } );
            }
            const findUser = await models.User.findOne( { _id: user._id } );

            expect( findUser.auth.sessions.length ).to.be.eq( 5 );
        } );
    } );
    describe( 'findUserBySocial', async () => {
        let id, provider;

        beforeEach( async() => {
            await dropDatabase();
            id = new ObjectID();
            provider = 'facebook';
            await UserFactory.create( { auth: { provider, id } } );
            await UserFactory.create( );
            await UserFactory.create( );
        } );

        it( 'get user by social data', async() => {
            const result = await UserModel.findUserBySocial( { id, provider } );

            expect( result ).to.be.exist;
        } );

        it( 'do not get user with invalid id', async() => {
            const result = await UserModel.findUserBySocial( { id: new ObjectID(), provider } );

            expect( result ).to.be.null;
        } );

        it( 'do not get user with invalid provider', async() => {
            const result = await UserModel.findUserBySocial( { id, provider: 'aaaa' } );

            expect( result ).to.be.null;
        } );
    } );
    describe( 'findUserByName', async () => {
        let name;

        beforeEach( async() => {
            await dropDatabase();
            name = 'facebook';
            await UserFactory.create( { name } );
            await UserFactory.create( );
            await UserFactory.create( );
        } );

        it( 'get user by name', async() => {
            const result = await UserModel.findUserByName( { name } );

            expect( result ).to.be.exist;
        } );

        it( 'do not get user with invalid name', async() => {
            const result = await UserModel.findUserByName( { name: 'aaa' } );

            expect( result ).to.be.null;
        } );
    } );
    describe( 'generateSocialLink', async () => {
        let provider, id, socialName;

        beforeEach( async() => {
            id = new ObjectID();
            socialName = 'socialName';
        } );

        it( 'get facebook link', async() => {
            provider = 'facebook';
            const result = await generateSocialLink( { provider, id, socialName } );

            expect( result ).to.be.eq( id );
        } );

        it( 'get instagram link', async() => {
            provider = 'instagram';
            const result = await generateSocialLink( { provider, id, socialName } );

            expect( result ).to.be.eq( socialName );
        } );

        it( 'should return null', async() => {
            const result = await generateSocialLink( { provider: 'aa', id } );

            expect( result ).to.be.null;
        } );

    } );
    describe( 'destroySession', async () => {
        let user, session;

        beforeEach( async() => {
            await dropDatabase();
            session = {
                _id: new ObjectID(),
                sid: new ObjectID(),
                secret_token: crypto.SHA512( `${new Date()}` ).toString()
            };

            user = await UserFactory.create( { auth: { sessions: [ session ] } } );
        } );

        it( 'remove user session', async() => {
            await UserModel.destroySession( { user_id: user._id, session } );
            const findUser = await models.User.findOne( { _id: user._id } );

            expect( findUser.auth.sessions.length ).to.be.eq( 0 );
        } );

        it( 'remove user session with many sessions', async() => {
            const session1 = {
                _id: new ObjectID(),
                sid: new ObjectID(),
                secret_token: crypto.SHA512( `${new Date()}` ).toString()
            };
            const session2 = {
                _id: new ObjectID(),
                sid: new ObjectID(),
                secret_token: crypto.SHA512( `${new Date()}` ).toString()
            };

            user = await UserFactory.create( { auth: { sessions: [ session1, session2 ] } } );
            await UserModel.destroySession( { user_id: user._id, session: session1 } );
            const findUser = await models.User.findOne( { _id: user._id } );

            expect( findUser.auth.sessions.length ).to.be.eq( 1 );
        } );
    } );
    describe( 'removeLastSession', async () => {
        let user, session;

        beforeEach( async() => {
            await dropDatabase();
            session = {
                _id: new ObjectID(),
                sid: new ObjectID(),
                secret_token: crypto.SHA512( `${new Date()}` ).toString()
            };

            user = await UserFactory.create( { auth: { sessions: [ session ] } } );
        } );

        it( 'not remove with one session', async() => {
            await UserModel.destroyLastSession( { user } );
            const findUser = await models.User.findOne( { _id: user._id } );

            expect( findUser.auth.sessions.length ).to.be.eq( 1 );
        } );

        it( 'remove session if limit exceeded', async() => {
            let sessions = [];

            for( let i = 0;i < 6;i++ ) {
                sessions.push(
                    {
                        _id: new ObjectID(),
                        sid: new ObjectID(),
                        secret_token: crypto.SHA512( `${new Date()}` ).toString()
                    }
                );
            }

            user = await UserFactory.create( { auth: { sessions } } );
            await UserModel.destroyLastSession( { user } );
            const findUser = await models.User.findOne( { _id: user._id } );

            expect( findUser.auth.sessions.length ).to.be.eq( 5 );
            expect( findUser.auth.sessions[ 4 ]._id.toString() ).to.be.eql( sessions[ 5 ]._id.toString() );
            expect( findUser.auth.sessions[ 0 ]._id.toString() ).to.be.eql( sessions[ 1 ]._id.toString() );
        } );
    } );
} );
