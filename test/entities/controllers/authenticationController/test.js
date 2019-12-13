const { chai, chaiHttp, app, sinon, dropDatabase, AuthStrategies, ObjectID, crypto, AuthenticationModule, jwt } = require( '../../../testHelper' );
const { UserFactory } = require( '../../../factories/index' );

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
        } );

        it( 'should authorize with valid token', async () => {
            sinon.stub( AuthStrategies, 'facebookStrategy' ).returns( Promise.resolve( { user, session } ) );
            const result = await chai.request( app ).post( '/auth/facebook' ).send( { access_token: 'some_token' } );

            result.should.have.status( 200 );
            expect( result.headers['access-token'] ).to.be.exist;
        } );

        it( 'check access_token', async () => {
            sinon.stub( AuthStrategies, 'facebookStrategy' ).returns( Promise.resolve( { user, session } ) );
            const result = await chai.request( app ).post( '/auth/facebook' ).send( { access_token: 'some_token' } );
            const token = await AuthenticationModule.TokenSalt.decodeToken( { access_token: result.headers['access-token'] } );
            const decoded_token = jwt.decode( token );

            expect( decoded_token.name ).to.be.eq( name );
            expect( decoded_token.sid ).to.be.eq( session.sid.toString() );
        } );

        it( 'check auth in view', async () => {
            sinon.stub( AuthStrategies, 'facebookStrategy' ).returns( Promise.resolve( { user: user.toObject(), session } ) );
            const result = await chai.request( app ).post( '/auth/facebook' ).send( { access_token: 'some_token' } );

            expect( result.body.user.auth ).to.be.undefined;
        } );
    } );
} );
