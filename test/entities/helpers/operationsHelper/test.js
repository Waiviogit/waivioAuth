const { expect, dropDatabase } = require( '../../../testHelper' );

const rewire = require( 'rewire' );
const OperationsHelper = rewire( '../../../../utilities/helpers/operationsHelper' );
const getRequestData = OperationsHelper.__get__( 'getRequestData' );

describe( 'operations helper', async () => {
    describe( 'getRequestData', async () => {
        let actionType;

        it( 'get post action url', async() => {
            actionType = 'waivio_guest_comment';
            const { url, type } = getRequestData( { actionType } );

            expect( type ).to.be.eq( 'post' );
            expect( url ).to.be.eq( 'https://test.waiviodev.com/objects-bot/guest-create-comment' );
        } );

        it( 'get custom_json action url', async() => {
            actionType = 'waivio_guest_vote';
            const { url, type } = getRequestData( { actionType } );

            expect( type ).to.be.eq( 'post' );
            expect( url ).to.be.eq( 'https://test.waiviodev.com/objects-bot/guest-custom-json' );
        } );

        it( 'get api action url', async() => {
            actionType = 'waivio_guest_update';
            const { url, type } = getRequestData( { actionType, userName: 'userName' } );

            expect( type ).to.be.eq( 'put' );
            expect( url ).to.be.eq( 'https://test.waiviodev.com/api/userName/userMetadata' );
        } );

        it( 'should not get action url with invalid type', async() => {
            actionType = 'aaa';
            const result = getRequestData( { actionType } );

            expect( result ).to.be.undefined;
        } );
    } );
} );
