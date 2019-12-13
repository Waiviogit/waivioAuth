const { expect, models, sinon, dropDatabase, AuthenticationModule, ObjectID, crypto } = require( '../../../../testHelper' );
const { UserFactory } = require( '../../../../factories' );

describe( 'auth', async () => {

    describe( 'socialAuth', async () => {
        let name, avatar_url, provider, id, next, new_session;

        beforeEach( async () => {
            await dropDatabase();
            id = new ObjectID().toString();
            name = 'name';
            provider = 'facebook';
            avatar_url = 'image_url';
            next = async ( error, user, session ) => {
                return { user, session, error };
            };
            new_session = {
                sid: new ObjectID(),
                secret_token: crypto.SHA512( `${new Date()}` ).toString()
            };
        } );

        afterEach( () => {
            sinon.restore();
        } );

        it( 'should created with not exist user with avatar', async () => {
            const { user, session } = await AuthenticationModule.Auth.socialAuth( { name, provider, avatar_url, id, next } );

            expect( user.auth.sessions.length ).to.be.eq( 1 );
            expect( user.json_metadata ).to.be.eq( JSON.stringify( { profile: { profile_image: 'image_url' } } ) );
            expect( user.auth.provider ).to.be.eq( provider );
            expect( user.auth.sessions[ 0 ].sid ).to.be.eql( session.sid.toString() );
            expect( user.auth.sessions[ 0 ].secret_token ).to.be.eq( session.secret_token );
            expect( user.alias ).to.be.eq( name );
            expect( user.name ).to.be.eq( `${provider}|${id}` );
        } );

        it( 'should created with not exist user without avatar', async () => {
            const { user, session } = await AuthenticationModule.Auth.socialAuth( { name, provider, avatar_url: null, id, next } );

            expect( user.auth.sessions.length ).to.be.eq( 1 );
            expect( user.json_metadata ).to.be.eq( JSON.stringify( { profile: { profile_image: null } } ) );
            expect( user.auth.provider ).to.be.eq( provider );
            expect( user.auth.sessions[ 0 ].sid ).to.be.eql( session.sid.toString() );
            expect( user.auth.sessions[ 0 ].secret_token ).to.be.eq( session.secret_token );
            expect( user.alias ).to.be.eq( name );
            expect( user.name ).to.be.eq( `${provider}|${id}` );
        } );

        it( 'should created with exist user without avatar', async () => {
            await UserFactory.create( { name: `${provider}|${id}`, alias: name, auth: { id: id, provider: 'facebook', sessions: [ new_session ] } } );
            const { user, session } = await AuthenticationModule.Auth.socialAuth( { name, provider, avatar_url, id, next } );
            const users = await models.User.find();

            expect( users.length ).to.be.eq( 1 );
            expect( user.auth.sessions.length ).to.be.eq( 2 );
            expect( user.json_metadata ).to.be.eq( JSON.stringify( { profile: { profile_image: 'image_url' } } ) );
            expect( user.auth.provider ).to.be.eq( provider );
            expect( user.auth.sessions[ 1 ].sid ).to.be.eql( session.sid.toString() );
            expect( user.auth.sessions[ 1 ].secret_token ).to.be.eq( session.secret_token );
            expect( user.alias ).to.be.eq( name );
            expect( user.name ).to.be.eq( `${provider}|${id}` );
        } );

        it( 'should return error', async () => {
            sinon.stub( models.User, 'findOne' ).throws( Error( 'Some error' ) );
            const { error } = await AuthenticationModule.Auth.socialAuth( { name, provider, avatar_url, id, next } );

            expect( error ).to.be.exist;
        } );

    } );

} );
