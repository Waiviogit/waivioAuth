const { faker, userModel } = require( '../../testHelper' );

const Create = async ( { name } = {} ) => {
    name = name || faker.name.firstName();
    const user = await userModel.create( { name } );

    return { user: user };
};

module.exports = { Create };
