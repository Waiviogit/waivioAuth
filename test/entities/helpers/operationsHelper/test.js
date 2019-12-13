const { expect, models, dropDatabase, UserModel, ObjectID, crypto } = require( '../../../testHelper' );
const { UserFactory } = require( '../../../factories' );

const rewire = require( 'rewire' );
const OperationsHelper = rewire( '../../../../utilities/helpers/operationsHelper' );
const getRoute = OperationsHelper.__get__( 'getRoute' );

describe( 'operations helper', async () => {
    describe( 'getRoute', async () => {
        let actionType;

        beforeEach( async() => {

        } );

        it( 'get post action url', async() => {
            actionType = 'post';
            const result = getRoute( { actionType } );

            expect( result ).to.be.eq( 1 );
        } );
    } );
} );
