const chai = require( 'chai' );
const chaiHttp = require( 'chai-http' );
const sinon = require( 'sinon' );
const expect = chai.expect;
const ObjectID = require( 'bson' ).ObjectID;
const faker = require( 'faker' );
const app = require( '../app' );
const { Mongoose } = require( '../database' );
const { models } = require( '../database' );
const { UserModel } = require( '../models' );
const AuthenticationModule = require( '../utilities/authentication' );
const { mockRequest, mockResponse } = require( 'mock-req-res' );
const api_prefix = '/waivio-auth';

const dropDatabase = async () => {
    for( const model in models ) {
        await models[ model ].deleteMany();
    }
};

module.exports = {
    app,
    chai,
    chaiHttp,
    expect,
    faker,
    sinon,
    ObjectID,
    AuthenticationModule,
    models,
    Mongoose,
    dropDatabase,
    api_prefix,
    mockRequest,
    mockResponse
};
