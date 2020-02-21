const { faker } = require( '../../../testHelper' );

exports.auth = ( data = {} ) => {
    if ( data.twoFa ) {
        return{
            status: 200,
            data:
                { 'code': 321,
                    'response': 'TWO_FA_VERIFICATION_NEEDED',
                    'payload': {
                        'token2fa': data.token || faker.getRandomString( 20 )
                    } }
        };
    }
    if ( data.error ) {
        return {
            status: 200,
            data: {
                'code': 404,
                'response': 'REGION_ERROR'
            }
        };
    }
    return {
        status: 200,
        data: {
            'response': 'SUCCESS',
            payload: {
                'crmToken': faker.getRandomString( 20 ),
                'sessionId': data.sid || faker.getRandomString( 20 ),
                'stompUser': faker.getRandomString( 20 ),
                'stompPassword': faker.getRandomString( 20 )
            }
        }
    };
};
