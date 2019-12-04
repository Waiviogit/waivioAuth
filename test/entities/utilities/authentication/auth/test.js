const { sinon, Authentication, expect, mockRequest, mockResponse } = require( '../../../../testHelper' );
const { adminFactory, tokenFactory } = require( '../../../../factories' );
const jwt = require( 'jsonwebtoken' );

describe( 'auth', async () => {

    // describe( 'validate_auth_token', async () => {
    //     let admin;
    //     let next;
    //
    //     beforeEach( async () => {
    //         admin = await adminFactory.create( { email: 'user@com.ua', password: 'pass' } );
    //     } );
    //
    //     it( 'should return success with all valid params', async () => {
    //         const { session, auth_token } = await tokenFactory.create( { client: admin } );
    //
    //         await admin.set( { sessions: [ session ] } );
    //         await admin.save();
    //         const req = mockRequest( { headers: { authorization: auth_token }, connection: { remoteAddress: '::ffff:127.0.0.1' } } );
    //         const res = mockResponse();
    //
    //         next = () => {
    //             res.status.args[ 0 ] = 200;
    //         };
    //
    //         await Authentication.Auth.validateAuthToken( req, res, next );
    //
    //         expect( res.status.args[ 0 ] ).to.be.eql( 200 );
    //     } );
    //
    //     it( 'should return success with expire valid user token', async () => {
    //         const { session, auth_token } = await tokenFactory.create( { client: admin } );
    //
    //         await admin.set( { sessions: [ session ] } );
    //         await admin.save();
    //         const req = mockRequest( { headers: { authorization: auth_token }, connection: { remoteAddress: '::ffff:127.0.0.1' } } );
    //         const res = mockResponse();
    //
    //         next = () => {
    //             res.status.args[ 0 ] = 200;
    //         };
    //         await new Promise( ( resolve ) => setTimeout( resolve, 2200 ) );
    //         await Authentication.Auth.validateAuthToken( req, res, next );
    //
    //         expect( res.status.args[ 0 ] ).to.be.eql( 200 );
    //     } );
    //
    //     it( 'should return unauthorize with expire token and invalid ip', async () => {
    //         const { session, auth_token } = await tokenFactory.create( { client: admin } );
    //
    //         await admin.set( { sessions: [ session ] } );
    //         await admin.save();
    //         const req = mockRequest( { headers: { authorization: auth_token }, connection: { remoteAddress: '::ffff:127.0.0.2' } } );
    //         const res = mockResponse();
    //
    //         next = () => {
    //             res.status.args[ 0 ] = 200;
    //         };
    //         await new Promise( ( resolve ) => setTimeout( resolve, 2200 ) );
    //         await Authentication.Auth.validateAuthToken( req, res, next );
    //
    //         expect( res.status.args[ 0 ][ 0 ] ).to.be.eq( 401 );
    //     } );
    //
    //     it( 'should return unauthorize with invalid token', async () => {
    //         const { session } = await tokenFactory.create( { client: admin } );
    //
    //         await admin.set( { sessions: [ session ] } );
    //         await admin.save();
    //         const req = mockRequest( { headers: { authorization: 'asdasd' }, connection: { remoteAddress: '::ffff:127.0.0.1' } } );
    //         const res = mockResponse();
    //
    //         next = () => {
    //             res.status.args[ 0 ] = 200;
    //         };
    //         await Authentication.Auth.validateAuthToken( req, res, next );
    //
    //         expect( res.status.args[ 0 ][ 0 ] ).to.be.eq( 401 );
    //     } );
    //
    //     it( 'should return unauthorize with empty token', async () => {
    //         const { session } = await tokenFactory.create( { client: admin } );
    //
    //         await admin.set( { sessions: [ session ] } );
    //         await admin.save();
    //         const req = mockRequest( { headers: { authorization: '' }, connection: { remoteAddress: '::ffff:127.0.0.1' } } );
    //         const res = mockResponse();
    //
    //         next = () => {
    //             res.status.args[ 0 ] = 200;
    //         };
    //         await Authentication.Auth.validateAuthToken( req, res, next );
    //
    //         expect( res.status.args[ 0 ][ 0 ] ).to.be.eq( 401 );
    //     } );
    //
    //     it( 'should return unauthorize without token', async () => {
    //         const { session } = await tokenFactory.create( { client: admin } );
    //
    //         await admin.set( { sessions: [ session ] } );
    //         await admin.save();
    //         const req = mockRequest( { headers: { }, connection: { remoteAddress: '::ffff:127.0.0.1' } } );
    //         const res = mockResponse();
    //
    //         next = () => {
    //             res.status.args[ 0 ] = 200;
    //         };
    //         await Authentication.Auth.validateAuthToken( req, res, next );
    //
    //         expect( res.status.args[ 0 ][ 0 ] ).to.be.eq( 401 );
    //     } );
    //
    //     it( 'should return unauthorize with another token', async () => {
    //         const another_user = await adminFactory.create( { email: 'user@com.ua', password: 'pass' } );
    //         const { session } = await tokenFactory.create( { client: admin } );
    //         const anotherUserSession = await tokenFactory.create( { client: another_user } );
    //
    //         await admin.set( { sessions: [ session ] } );
    //         await admin.save();
    //         const req = mockRequest( { headers: { authorization: anotherUserSession.auth_token }, connection: { remoteAddress: '::ffff:127.0.0.1' } } );
    //         const res = mockResponse();
    //
    //         next = () => {
    //             res.status.args[ 0 ] = 200;
    //         };
    //         await Authentication.Auth.validateAuthToken( req, res, next );
    //
    //         expect( res.status.args[ 0 ][ 0 ] ).to.be.eq( 401 );
    //     } );
    //
    //     it( 'should return unauthorize with jwt decoding error', async () => {
    //         sinon.stub( jwt, 'verify' ).throws( new Error( 'something bad happened' ) );
    //         const { session, auth_token } = await tokenFactory.create( { client: admin } );
    //
    //         await admin.set( { sessions: [ session ] } );
    //         await admin.save();
    //         const req = mockRequest( { headers: { authorization: auth_token }, connection: { remoteAddress: '::ffff:127.0.0.1' } } );
    //         const res = mockResponse();
    //
    //         next = () => {
    //             res.status.args[ 0 ] = 200;
    //         };
    //         await Authentication.Auth.validateAuthToken( req, res, next );
    //
    //         expect( res.status.args[ 0 ][ 0 ] ).to.be.eq( 401 );
    //     } );
    //
    // } );

} );
