const { chai, chaiHttp, app, sinon, dropDatabase, AuthStrategies, ObjectID, crypto, faker, AuthenticationModule, jwt, OperationsHelper } = require( '../../../testHelper' );
const { UserFactory, TokenFactory } = require( '../../../factories/index' );
const axios = require( 'axios' );
const beaxyMock = require( './beaxyMock' );
const setCookie = require( 'set-cookie-parser' );

chai.use( chaiHttp );
chai.should();
const expect = chai.expect;


describe( 'Authorization', async () => {

    beforeEach( async () => {
        await dropDatabase();
    } );

    describe( 'social sign in', async () => {
        let user, name, alias, provider, session, userName;

        beforeEach( async () => {
            name = 'facebook|312321312';
            userName = 'waivio_username';
            alias = 'alias';
            provider = 'facebook';
            session = {
                sid: new ObjectID(),
                secret_token: crypto.SHA512( `${new Date()}` ).toString()
            };

            user = await UserFactory.create( {
                name,
                alias,
                auth: { id: new ObjectID(), provider, sessions: [ session ] }
            } );
        } );

        afterEach( () => {
            sinon.restore();
        } );
        it( 'should not authorize with invalid token', async () => {
            const result = await chai.request( app ).post( '/auth/facebook' ).send( {
                userName: userName,
                access_token: 'some_token'
            } );

            result.should.have.status( 401 );
            expect( result.headers[ 'access-token' ] ).to.be.undefined;
        } );

        it( 'should not authorize without token', async () => {
            const result = await chai.request( app ).post( '/auth/facebook' ).send( { userName: userName } );

            result.should.have.status( 401 );
            expect( result.headers[ 'access-token' ] ).to.be.undefined;
        } );

        it( 'should authorize with valid token', async () => {
            sinon.stub( OperationsHelper, 'transportAction' ).returns( Promise.resolve( { success: true } ) );
            sinon.stub( AuthStrategies, 'socialStrategy' ).returns( Promise.resolve( { user, session } ) );
            const result = await chai.request( app ).post( '/auth/facebook' ).send( {
                userName: userName,
                access_token: 'some_token'
            } );

            result.should.have.status( 200 );
            expect( result.headers[ 'access-token' ] ).to.be.exist;
        } );

        it( 'should not registrate with invalid name', async () => {
            sinon.stub( OperationsHelper, 'transportAction' ).returns( Promise.resolve( { success: true } ) );
            sinon.stub( AuthStrategies, 'socialStrategy' ).returns( Promise.resolve( { user, session } ) );
            const result = await chai.request( app ).post( '/auth/facebook' ).send( {
                access_token: 'some_token',
                userName: 'aa'
            } );

            result.should.have.status( 422 );
        } );

        it( 'should not registrate with invalid name contains prefix waivio', async () => {
            sinon.stub( OperationsHelper, 'transportAction' ).returns( Promise.resolve( { success: true } ) );
            sinon.stub( AuthStrategies, 'socialStrategy' ).returns( Promise.resolve( { user, session } ) );
            const result = await chai.request( app ).post( '/auth/facebook' ).send( {
                access_token: 'some_token',
                userName: 'waivio_!dad'
            } );

            result.should.have.status( 422 );
        } );

        it( 'should not registrate with valid minlength', async () => {
            sinon.stub( OperationsHelper, 'transportAction' ).returns( Promise.resolve( { success: true } ) );
            sinon.stub( AuthStrategies, 'socialStrategy' ).returns( Promise.resolve( { user, session } ) );
            const result = await chai.request( app ).post( '/auth/facebook' ).send( {
                access_token: 'some_token',
                userName: 'waivio_a'
            } );

            result.should.have.status( 200 );
        } );

        it( 'should not registrate with invalid maxlength name', async () => {
            sinon.stub( OperationsHelper, 'transportAction' ).returns( Promise.resolve( { success: true } ) );
            sinon.stub( AuthStrategies, 'socialStrategy' ).returns( Promise.resolve( { user, session } ) );
            const result = await chai.request( app ).post( '/auth/facebook' ).send( {
                access_token: 'some_token',
                userName: 'waivio_aaaaaaaaaaaaaaaaaaaaaaaaaa'
            } );

            result.should.have.status( 422 );
        } );

        it( 'should registrate with valid name', async () => {
            sinon.stub( OperationsHelper, 'transportAction' ).returns( Promise.resolve( { success: true } ) );
            sinon.stub( AuthStrategies, 'socialStrategy' ).returns( Promise.resolve( { user, session } ) );
            const result = await chai.request( app ).post( '/auth/facebook' ).send( {
                access_token: 'some_token',
                userName
            } );

            result.should.have.status( 200 );
        } );

        it( 'check access_token', async () => {
            sinon.stub( OperationsHelper, 'transportAction' ).returns( Promise.resolve( { success: true } ) );
            sinon.stub( AuthStrategies, 'socialStrategy' ).returns( Promise.resolve( { user, session } ) );
            const result = await chai.request( app ).post( '/auth/facebook' ).send( {
                userName: userName,
                access_token: 'some_token'
            } );
            const token = await AuthenticationModule.TokenSalt.decodeToken( { access_token: result.headers[ 'access-token' ] } );
            const decoded_token = jwt.decode( token );

            expect( decoded_token.name ).to.be.eq( name );
            expect( decoded_token.sid ).to.be.eq( session.sid.toString() );
        } );

        it( 'check auth in view', async () => {
            sinon.stub( AuthStrategies, 'socialStrategy' ).returns( Promise.resolve( {
                user: user.toObject(),
                session
            } ) );
            const result = await chai.request( app ).post( '/auth/facebook' ).send( {
                userName: userName,
                access_token: 'some_token'
            } );

            expect( result.body.user.auth ).to.be.undefined;
        } );
    } );
    describe( 'validate auth token', async () => {
        let user, session, access_token;

        beforeEach( async () => {
            await dropDatabase();
            user = await UserFactory.create( { email: 'user@com.ua', password: 'pass' } );
            const tokenData = await TokenFactory.create( { client: user } );

            session = tokenData.session;
            access_token = tokenData.auth_token;
            await user.set( { auth: { sessions: [ session ] } } );
            await user.save();
        } );

        afterEach( () => {
            sinon.restore();
        } );
        it( 'should return success with valid token', async () => {
            const result = await chai.request( app ).post( '/auth/validate_auth_token' )
                .set( { 'access-token': access_token } );

            result.should.have.status( 200 );
            expect( result.headers[ 'access-token' ] ).to.be.exist;
        } );

        it( 'should return success with expired token', async () => {
            await new Promise( ( resolve ) => setTimeout( resolve, 2200 ) );
            const result = await chai.request( app ).post( '/auth/validate_auth_token' )
                .set( { 'access-token': access_token } );

            result.should.have.status( 200 );
            expect( result.headers[ 'access-token' ] ).to.be.exist;
        } );

        it( 'should return unauthorize with invalid token', async () => {
            const result = await chai.request( app ).post( '/auth/validate_auth_token' )
                .set( { 'access-token': 'aa' } );

            result.should.have.status( 401 );
            expect( result.headers[ 'access-token' ] ).to.be.undefined;
        } );

        it( 'should return unauthorize without token', async () => {
            const result = await chai.request( app ).post( '/auth/validate_auth_token' );

            result.should.have.status( 401 );
            expect( result.headers[ 'access-token' ] ).to.be.undefined;
        } );
    } );
    describe( 'hasSocialAccount', async () => {
        let id, provider;

        beforeEach( async () => {
            id = new ObjectID();
            provider = 'facebook';
            await dropDatabase();
            await UserFactory.create( { auth: { provider, id } } );
        } );


        it( 'should return true with exist user', async () => {
            const result = await chai.request( app ).get( `/auth/has_social_account?provider=facebook&id=${id}` );

            result.should.have.status( 200 );
            expect( result.body.result ).to.be.true;
        } );

        it( 'should return false with not exist provider', async () => {
            const result = await chai.request( app ).get( `/auth/has_social_account?provider=aa&id=${id}` );

            result.should.have.status( 200 );
            expect( result.body.result ).to.be.false;
        } );

        it( 'should return false with not exist id', async () => {
            const result = await chai.request( app ).get( '/auth/has_social_account?provider=facebook&id=aaa' );

            result.should.have.status( 200 );
            expect( result.body.result ).to.be.false;
        } );

        it( 'should return false without data', async () => {
            const result = await chai.request( app ).get( '/auth/has_social_account' );

            result.should.have.status( 422 );
        } );

        it( 'should return false without id', async () => {
            const result = await chai.request( app ).get( '/auth/has_social_account?provider=aa' );

            result.should.have.status( 422 );
        } );

        it( 'should return false without provider', async () => {
            const result = await chai.request( app ).get( '/auth/has_social_account?id=aa' );

            result.should.have.status( 422 );
        } );

    } );
    describe( 'On BeaxyAuth', async () => {
        afterEach( async () => {
            sinon.restore();
        } );
        describe( 'On OK without 2fa', async () => {
            let result, data, mock, cookie;
            beforeEach( async () => {
                cookie = faker.getRandomString( 10 );
                mock = beaxyMock.auth();
                data = {
                    authBy: 'credentials',
                    authData: { user: faker.internet.email(), password: faker.getRandomString() }
                };
                sinon.stub( axios, 'post' ).returns( Promise.resolve( mock ) );
                sinon.stub( setCookie, 'parse' ).returns( { um_session: { value: cookie } } );
                result = await chai.request( app )
                    .post( '/auth/beaxy' )
                    .send( data );
            } );
            it( 'should return status 200', async () => {
                expect( result ).to.have.status( 200 );
            } );
            it( 'should return um_session token in headers', async () => {
                expect( result.headers ).to.have.property( 'um_session', cookie );
            } );
            it( 'should return waivio access token in headers', async () => {
                expect( result.headers ).to.have.property( 'access-token' );
            } );
            it( 'should return correct beaxy sid', async () => {
                expect( result.body.payload.sessionId ).to.be.eq( mock.data.payload.sessionId );
            } );
            it( 'should create user with correct alias', async () => {
                expect( result.body.user.alias ).to.be.eq( data.authData.user.split( '@' )[ 0 ] );
            } );
        } );
        describe( 'On OK with 2fa auth needed', async () => {
            let result, data, mock;
            beforeEach( async () => {
                mock = beaxyMock.auth( { twoFa: true } );
                data = {
                    authBy: 'credentials',
                    authData: { user: faker.internet.email(), password: faker.getRandomString() }
                };
                sinon.stub( axios, 'post' ).returns( Promise.resolve( mock ) );
                result = await chai.request( app )
                    .post( '/auth/beaxy' )
                    .send( data );
            } );
            it( 'should return status 200', async () => {
                expect( result ).to.have.status( 200 );
            } );
            it( 'should return result with correct body', async () => {
                expect( result.body ).to.be.deep.eq( mock.data );
            } );
        } );
        describe( 'On success with 2fa auth', async () => {
            let result, data, mock, cookie;
            beforeEach( async () => {
                cookie = faker.getRandomString( 10 );
                mock = beaxyMock.auth();
                data = {
                    authBy: '2fa',
                    authData: {
                        user: faker.internet.email(),
                        token2fa: faker.getRandomString(),
                        code: faker.random.number()
                    }
                };
                sinon.stub( axios, 'post' ).returns( Promise.resolve( mock ) );
                sinon.stub( setCookie, 'parse' ).returns( { um_session: { value: cookie } } );
                result = await chai.request( app )
                    .post( '/auth/beaxy' )
                    .send( data );
            } );
            it( 'should return status 200', async () => {
                expect( result ).to.have.status( 200 );
            } );
            it( 'should return um_session token in headers', async () => {
                expect( result.headers ).to.have.property( 'um_session', cookie );
            } );
            it( 'should create user with correct alias', async () => {
                expect( result.body.user.alias ).to.be.eq( data.authData.user.split( '@' )[ 0 ] );
            } );
            it( 'should return correct beaxy sid', async () => {
                expect( result.body.payload.sessionId ).to.be.eq( mock.data.payload.sessionId );
            } );
        } );
        describe( 'On errors', async () => {
            let result, data, mock;
            beforeEach( async () => {
                mock = beaxyMock.auth( { error: true } );
                data = {
                    authBy: 'credentials',
                    authData: { user: faker.internet.email(), password: faker.getRandomString() }
                };
                sinon.stub( axios, 'post' ).returns( Promise.resolve( mock ) );
                result = await chai.request( app )
                    .post( '/auth/beaxy' )
                    .send( data );
            } );
            it( 'should return status 401', async () => {
                expect( result ).to.have.status( 401 );
            } );
            it( 'should return correct body', async () => {
                expect( result.body.message ).to.be.eq( mock.data.response );
            } );
        } );
    } );
    describe( 'On beaxyKeepAlive', async () => {
        afterEach( async () => {
            sinon.restore();
        } );
        describe( 'On OK', async () => {
            let result;
            beforeEach( async () => {
                sinon.stub( axios, 'get' ).returns( Promise.resolve( { status: 200 } ) );
                result = await chai.request( app )
                    .get( `/auth/beaxy_keepalive?sid=${faker.getRandomString()}` )
                    .set( { um_session: faker.getRandomString( 10 ) } );
            } );
            it( 'should return status 200', async () => {
                expect( result ).to.have.status( 200 );
            } );
            it( 'should return correct response', async () => {
                expect( result.body ).to.be.deep.eq( { result: 'ok' } );
            } );
        } );
        describe( 'On errors', async () => {
            let result;
            beforeEach( async () => {
                sinon.stub( axios, 'get' ).throws( { response: { statusText: 'test error' } } );
                result = await chai.request( app )
                    .get( `/auth/beaxy_keepalive?sid=${faker.getRandomString()}` )
                    .set( { um_session: faker.getRandomString( 10 ) } );

            } );
            it( 'should return status 404', async () => {
                expect( result ).to.have.status( 404 );
            } );
            it( 'should return correct message in error', async () => {
                expect( result.body ).to.be.deep.eq( { message: 'test error' } );

            } );
        } );
    } );

} );
