const { chai, chaiHttp, app, sinon, dropDatabase, AuthStrategies, ObjectID, crypto, AuthenticationModule, jwt, OperationsHelper } = require( '../../../testHelper' );
const { UserFactory, TokenFactory } = require( '../../../factories/index' );

chai.use( chaiHttp );
chai.should();
const expect = chai.expect;


describe( 'Authorization', async () => {

    beforeEach( async() => {
        await dropDatabase();
    } );

    describe( 'facebook sign in', async () => {
        let user, name, alias, provider, session;

        beforeEach( async() => {
            name = 'facebook|312321312';
            alias = 'alias';
            provider = 'facebook';
            session = {
                sid: new ObjectID(),
                secret_token: crypto.SHA512( `${new Date()}` ).toString()
            };

            user = await UserFactory.create( { name, alias, auth: { id: new ObjectID(), provider, sessions: [ session ] } } );
        } );

        afterEach( () => {
            sinon.restore();
        } );
        it( 'should not authorize with invalid token', async () => {
            const result = await chai.request( app ).post( '/auth/facebook' ).send( { access_token: 'some_token' } );

            result.should.have.status( 401 );
            expect( result.headers[ 'access-token' ] ).to.be.undefined;
        } );

        it( 'should not authorize without token', async () => {
            const result = await chai.request( app ).post( '/auth/facebook' ).send( { } );

            result.should.have.status( 401 );
            expect( result.headers[ 'access-token' ] ).to.be.undefined;
        } );

        it( 'should authorize with valid token', async () => {
            sinon.stub( OperationsHelper, 'transportAction' ).returns( Promise.resolve( { success: true } ) );
            sinon.stub( AuthStrategies, 'socialStrategy' ).returns( Promise.resolve( { user, session } ) );
            const result = await chai.request( app ).post( '/auth/facebook' ).send( { access_token: 'some_token' } );

            result.should.have.status( 200 );
            expect( result.headers[ 'access-token' ] ).to.be.exist;
        } );

        it( 'check access_token', async () => {
            sinon.stub( OperationsHelper, 'transportAction' ).returns( Promise.resolve( { success: true } ) );
            sinon.stub( AuthStrategies, 'socialStrategy' ).returns( Promise.resolve( { user, session } ) );
            const result = await chai.request( app ).post( '/auth/facebook' ).send( { access_token: 'some_token' } );
            const token = await AuthenticationModule.TokenSalt.decodeToken( { access_token: result.headers[ 'access-token' ] } );
            const decoded_token = jwt.decode( token );

            expect( decoded_token.name ).to.be.eq( name );
            expect( decoded_token.sid ).to.be.eq( session.sid.toString() );
        } );

        it( 'check auth in view', async () => {
            sinon.stub( AuthStrategies, 'socialStrategy' ).returns( Promise.resolve( { user: user.toObject(), session } ) );
            const result = await chai.request( app ).post( '/auth/facebook' ).send( { access_token: 'some_token' } );

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
} );
