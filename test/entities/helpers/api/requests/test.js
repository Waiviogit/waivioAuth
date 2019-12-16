const { expect, sinon, Requests, axios } = require( '../../../../testHelper' );

describe( 'Api requests', async () => {
    describe( 'Send request', async () => {

        afterEach( () => {
            sinon.restore();
        } );

        it( 'handle  request with invalid type of request', async() => {
            const result = await Requests.sendRequest( { path: '', type: 'someType' } );

            expect( result ).to.be.eql( { error: undefined, json: undefined, status: 500 } );
        } );

        it( 'handle request with invalid url type of request', async() => {
            const result = await Requests.sendRequest( { path: '', type: 'post' } );

            expect( result ).to.be.eql( { error: undefined, json: undefined, status: 500 } );
        } );
    } );
} );
