module.exports = {
    users: require( './usersValidator' ),
    validate: ( data, schema ) => {
        const result = schema.validate( data, { abortEarly: false } );

        if( result.error ) {
            return { validate_error: result.error };
        }
        return { params: result.value };

    }
};
