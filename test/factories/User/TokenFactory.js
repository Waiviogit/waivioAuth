const crypto = require('crypto-js');
const rewire = require('rewire');
const config = require('../../../config');
const { ObjectID } = require('../../testHelper');

const AuthRewire = rewire('../../../utilities/authentication/sessions');
const tokenSign = AuthRewire.__get__('tokenSign');

const encodeToken = ({ access_token }) => crypto.AES.encrypt(access_token, config.crypto_key).toString();

const decodeToken = async ({ access_token }) => crypto.AES.decrypt(access_token, config.crypto_key).toString(crypto.enc.Utf8);

const create = async (data = {}) => {
  const session = {
    sid: new ObjectID(),
    secret_token: crypto.SHA512(`${new Date()}`).toString(),
  };

  const auth_token = await tokenSign(data.client, session);

  return {
    session,
    auth_token: encodeToken(auth_token),
  };
};

module.exports = { create, decodeToken, encodeToken };
