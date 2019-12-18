const { AuthenticationModule, expect } = require( '../../../../testHelper' );
const { TokenFactory } = require( '../../../../factories' );

describe( 'tokenSalt', async () => {

    describe( 'encode token', async () => {
        let access_token;

        beforeEach( async () => {
            access_token = 'some_token';
        } );

        it( 'successfully token encode', async () => {
            const result = await AuthenticationModule.TokenSalt.encodeToken( { access_token } );
            const decoded = await TokenFactory.decodeToken( { access_token: result } );

            expect( decoded ).to.be.eql( access_token );
        } );

        it( 'successfully token decode', async () => {
            const result = await AuthenticationModule.TokenSalt.encodeToken( { access_token } );
            const decoded = await AuthenticationModule.TokenSalt.decodeToken( { access_token: result } );

            expect( decoded ).to.be.eql( access_token );
        } );

        it( 'should not decode invalid token', async () => {
            await AuthenticationModule.TokenSalt.encodeToken( { access_token } );
            const decoded = await AuthenticationModule.TokenSalt.decodeToken( { access_token: 'aaa' } );

            expect( decoded ).to.be.eql( '' );
        } );

    } );

} );
