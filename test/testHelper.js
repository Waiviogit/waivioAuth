const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');

const { expect } = chai;
const axios = require('axios');
const { ObjectID } = require('bson');
const faker = require('faker');
const jwt = require('jsonwebtoken');
const crypto = require('crypto-js');
const { mockRequest, mockResponse } = require('mock-req-res');
const app = require('../app');
const { Mongoose } = require('../database');
const { models } = require('../database');
const { UserModel } = require('../models');
const AuthenticationModule = require('../utilities/authentication');
const { OperationsHelper } = require('../utilities/helpers');
const Requests = require('../utilities/helpers/api/requests');
const AuthStrategies = require('../controllers/authStrategies');

const api_prefix = '/waivio-auth';

faker.getRandomString = (length = 5) => faker.internet.password(length, false, /[a-z]/);

const dropDatabase = async () => {
  for (const model in models) {
    await models[model].deleteMany();
  }
};

module.exports = {
  app,
  chai,
  axios,
  jwt,
  chaiHttp,
  expect,
  faker,
  sinon,
  crypto,
  ObjectID,
  AuthenticationModule,
  Requests,
  AuthStrategies,
  models,
  UserModel,
  OperationsHelper,
  Mongoose,
  dropDatabase,
  api_prefix,
  mockRequest,
  mockResponse,
};
