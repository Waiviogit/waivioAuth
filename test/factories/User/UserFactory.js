const { faker, models } = require( '../../testHelper' );

const create = async ( { name, alias, json_metadata, auth } ) => {
    const userData = {
        name: name || `${faker.name.firstName()}${faker.random.number()}`,
        alias: alias || `${faker.name.firstName()}${faker.random.number()}`,
        json_metadata: json_metadata || '',
        auth: auth
    };

    const user = new models.User( userData );


    await user.save();
    return user;
};

module.exports = { create };
