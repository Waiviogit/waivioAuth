const { expect, models, dropDatabase, UserModel, ObjectID, crypto } = require( '../../../testHelper' );
const { UserFactory } = require( '../../../factories' );

const rewire = require( 'rewire' );
const UserModelRewire = rewire( '../../../../models/userModel' );
const getUserMetadata = UserModelRewire.__get__( 'getUserMetadata' );

describe( 'userModel', async () => {
    describe( 'findOrCreateSocial', async () => {
        let query, name, alias, session, provider, metadata, auth_id;

        beforeEach( async() => {
            await dropDatabase();
            auth_id = new ObjectID().toString();
            name = 'name';
            alias = 'alias';
            provider = 'facebook';
            session = {
                sid: new ObjectID(),
                secret_token: crypto.SHA512( `${new Date()}` ).toString()
            };

            query = { name, alias, 'auth.provider': provider, 'auth.id': auth_id };
            metadata = { profile_image: 'image_url' };
        } );

        it( 'should create user with avatar', async() => {
            await UserModel.findOrCreateSocial( { query, session, metadata } );
            const user = await models.User.findOne( { name } );

            expect( user.auth.sessions.length ).to.be.eq( 1 );
            expect( user.json_metadata ).to.be.eq( JSON.stringify( { profile: { profile_image: 'image_url' } } ) );
            expect( user.auth.provider ).to.be.eq( provider );
            expect( user.auth.sessions[ 0 ].sid ).to.be.eql( session.sid.toString() );
            expect( user.auth.sessions[ 0 ].secret_token ).to.be.eq( session.secret_token );
            expect( user.alias ).to.be.eq( alias );
            expect( user.name ).to.be.eq( name );
        } );

        it( 'get actual data', async() => {
            const result = await UserModel.findOrCreateSocial( { query, session, metadata } );

            expect( result.auth.sessions.length ).to.be.eq( 1 );
        } );

        it( 'should create user without avatar', async() => {
            await UserModel.findOrCreateSocial( { query, session } );
            const user = await models.User.findOne( { name } );

            expect( user.auth.sessions.length ).to.be.eq( 1 );
            expect( user.json_metadata ).to.be.eq( JSON.stringify( { profile: { } } ) );
            expect( user.auth.provider ).to.be.eq( provider );
            expect( user.auth.sessions[ 0 ].sid ).to.be.eql( session.sid.toString() );
            expect( user.auth.sessions[ 0 ].secret_token ).to.be.eq( session.secret_token );
            expect( user.alias ).to.be.eq( alias );
            expect( user.name ).to.be.eq( name );
        } );

        it( 'should update user without metadata with early created with empty metadata', async() => {
            await UserFactory.create( { name, alias, auth: { id: auth_id, provider: 'facebook', sessions: [ session ] } } );
            await UserModel.findOrCreateSocial( { query, session } );
            const user = await models.User.findOne( { name } );

            expect( await models.User.find().countDocuments() ).to.be.eq( 1 );
            expect( user.auth.sessions.length ).to.be.eq( 2 );
            expect( user.json_metadata ).to.be.eq( JSON.stringify( { profile: { } } ) );
            expect( user.auth.provider ).to.be.eq( provider );
            expect( user.auth.sessions[ 0 ].sid ).to.be.eql( session.sid.toString() );
            expect( user.auth.sessions[ 0 ].secret_token ).to.be.eq( session.secret_token );
            expect( user.alias ).to.be.eq( alias );
            expect( user.name ).to.be.eq( name );
        } );

        it( 'should update user with metadata with early created with empty metadata', async() => {
            await UserFactory.create( { name, alias, auth: { id: auth_id, provider: 'facebook', sessions: [ session ] } } );
            await UserModel.findOrCreateSocial( { query, session, metadata } );
            const user = await models.User.findOne( { name } );

            expect( await models.User.find().countDocuments() ).to.be.eq( 1 );
            expect( user.auth.sessions.length ).to.be.eq( 2 );
            expect( user.json_metadata ).to.be.eq( JSON.stringify( { profile: { profile_image: 'image_url' } } ) );
            expect( user.auth.provider ).to.be.eq( provider );
            expect( user.auth.sessions[ 0 ].sid ).to.be.eql( session.sid.toString() );
            expect( user.auth.sessions[ 0 ].secret_token ).to.be.eq( session.secret_token );
            expect( user.alias ).to.be.eq( alias );
            expect( user.name ).to.be.eq( name );
        } );

        it( 'should set user image with invalid user metadata', async() => {
            await UserFactory.create( {
                name,
                alias,
                auth: { id: auth_id,
                    provider: 'facebook',
                    sessions: [ session ]
                },
                json_metadata: 'sdkjfklsdjf' } );
            await UserModel.findOrCreateSocial( { query, session, metadata } );
            const user = await models.User.findOne( { name } );

            expect( await models.User.find().countDocuments() ).to.be.eq( 1 );
            expect( user.auth.sessions.length ).to.be.eq( 2 );
            expect( user.json_metadata ).to.be.eq( JSON.stringify( { profile: { profile_image: 'image_url' } } ) );
            expect( user.auth.provider ).to.be.eq( provider );
            expect( user.auth.sessions[ 0 ].sid ).to.be.eql( session.sid.toString() );
            expect( user.auth.sessions[ 0 ].secret_token ).to.be.eq( session.secret_token );
            expect( user.alias ).to.be.eq( alias );
            expect( user.name ).to.be.eq( name );
        } );

        it( 'should update user image', async() => {
            await UserFactory.create( {
                name,
                alias,
                auth: { id: auth_id,
                    provider: 'facebook',
                    sessions: [ session ]
                },
                json_metadata: JSON.stringify( { profile: { image_profile: 'old_url' } } )
            } );
            await UserModel.findOrCreateSocial( { query, session, metadata } );
            const user = await models.User.findOne( { name } );

            expect( await models.User.find().countDocuments() ).to.be.eq( 1 );
            expect( user.auth.sessions.length ).to.be.eq( 2 );
            expect( user.json_metadata ).to.be.eq( JSON.stringify( { profile: { profile_image: 'image_url' } } ) );
            expect( user.auth.provider ).to.be.eq( provider );
            expect( user.auth.sessions[ 0 ].sid ).to.be.eql( session.sid.toString() );
            expect( user.auth.sessions[ 0 ].secret_token ).to.be.eq( session.secret_token );
            expect( user.alias ).to.be.eq( alias );
            expect( user.name ).to.be.eq( name );
        } );
    } );
    describe( 'getUserMetadata', async () => {
        let user;

        beforeEach( async() => {
            user = { json_metadata: '' };
        } );

        it( 'get user metadata with empty user metadata', async() => {
            const result = await getUserMetadata( { user } );

            expect( result ).to.be.eql( {} );
        } );

        it( 'get user metadata with invalid metadata', async() => {
            user.json_metadata = 'invalid_data';
            const result = await getUserMetadata( { user } );

            expect( result ).to.be.eql( {} );
        } );

        it( 'get user metadata with valid metadata', async() => {
            user.json_metadata = JSON.stringify( { data: { key: 'value' } } );
            const result = await getUserMetadata( { user } );

            expect( result ).to.be.eql( { data: { key: 'value' } } );
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
