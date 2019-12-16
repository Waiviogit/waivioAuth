const { chai, chaiHttp, app, sinon, dropDatabase, ObjectID, Requests } = require( '../../../testHelper' );
const { UserFactory, TokenFactory } = require( '../../../factories/index' );

chai.use( chaiHttp );
chai.should();
const expect = chai.expect;


describe( 'Operations Controller', async () => {

    describe( 'transportAction', async () => {
        let user, name, alias, mockRequests, auth_token, payload, session;

        beforeEach( async() => {
            await dropDatabase();
            user = await UserFactory.create( { name, alias, auth: { id: new ObjectID(), sessions: [ session ] } } );
            const tokenData = await TokenFactory.create( { client: user } );

            await user.set( { auth: { sessions: [ tokenData.session ] } } );
            await user.save();

            auth_token = tokenData.auth_token;
            payload = { id: 'waivio_guest_follow', data: { some_key: 'some_value' } };
            mockRequests = { status: 200, json: { some_key: 'some_value' } };

        } );

        afterEach( () => {
            sinon.restore();
        } );

        it( 'should return unauthorized without access token', async () => {
            const result = await chai.request( app )
                .post( '/auth/guest_operations' )
                .set( { 'access-token': 'some_token' } )
                .send( payload );

            result.should.have.status( 401 );
        } );

        it( 'should return success with custom json id', async () => {
            sinon.stub( Requests, 'sendRequest' ).returns( Promise.resolve( mockRequests ) );
            const result = await chai.request( app )
                .post( '/auth/guest_operations' )
                .set( { 'access-token': auth_token } )
                .send( payload );

            result.should.have.status( 200 );
            expect( result.body ).to.be.eql( { some_key: 'some_value' } );
        } );

        it( 'should return success with custom json id and custom status', async () => {
            mockRequests.status = 201;
            sinon.stub( Requests, 'sendRequest' ).returns( Promise.resolve( mockRequests ) );
            const result = await chai.request( app )
                .post( '/auth/guest_operations' )
                .set( { 'access-token': auth_token } )
                .send( payload );

            result.should.have.status( 201 );
            expect( result.body ).to.be.eql( { some_key: 'some_value' } );
        } );

        it( 'should return success with waivio_guest_comment', async () => {
            payload.id = 'waivio_guest_comment';
            sinon.stub( Requests, 'sendRequest' ).returns( Promise.resolve( mockRequests ) );
            const result = await chai.request( app )
                .post( '/auth/guest_operations' )
                .set( { 'access-token': auth_token } )
                .send( payload );

            result.should.have.status( 200 );
            expect( result.body ).to.be.eql( { some_key: 'some_value' } );
        } );

        it( 'should return success with waivio_guest_comment with userName', async () => {
            payload.id = 'waivio_guest_update';
            payload.userName = 'userName';
            sinon.stub( Requests, 'sendRequest' ).returns( Promise.resolve( mockRequests ) );
            const result = await chai.request( app )
                .post( '/auth/guest_operations' )
                .set( { 'access-token': auth_token } )
                .send( payload );

            result.should.have.status( 200 );
            expect( result.body ).to.be.eql( { some_key: 'some_value' } );
        } );

        it( 'should return error with invalid id', async () => {
            payload.id = 'asdasd';
            const result = await chai.request( app )
                .post( '/auth/guest_operations' )
                .set( { 'access-token': auth_token } )
                .send( payload );

            result.should.have.status( 422 );
        } );
    } );
} );
