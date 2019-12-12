const chai = require( 'chai' );
const chaiHttp = require( 'chai-http' );
const sinon = require( 'sinon' );
const expect = chai.expect;
const ObjectID = require( 'bson' ).ObjectID;
const faker = require( 'faker' );
const jwt = require( 'jsonwebtoken' );
const app = require( '../app' );
const crypto = require( 'crypto-js' );
const { Mongoose } = require( '../database' );
const { models } = require( '../database' );
const { UserModel } = require( '../models' );
const AuthenticationModule = require( '../utilities/authentication' );
const AuthStrategies = require( '../controllers/authStrategies' );
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
    jwt,
    chaiHttp,
    expect,
    faker,
    sinon,
    crypto,
    ObjectID,
    AuthenticationModule,
    AuthStrategies,
    models,
    UserModel,
    Mongoose,
    dropDatabase,
    api_prefix,
    mockRequest,
    mockResponse
};
