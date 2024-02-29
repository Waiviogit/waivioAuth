const { userFactory, tokenFactory } = require('../factories/index');

module.exports = async (email = 'user@com.ua', password = 'pass') => {
  const admin = await userFactory.create({ email, password });
  const { session, auth_token } = await tokenFactory.create({ client: admin });

  admin.sessions = [session];
  await admin.save();

  return auth_token;
};
