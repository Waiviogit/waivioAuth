const axios = require('axios');
const {
  expect, sinon, dropDatabase, AuthenticationModule, ObjectID, crypto, OperationsHelper, Requests,
} = require('../../../../testHelper');
const { UserFactory } = require('../../../../factories');

describe('auth', async () => {
  describe('socialAuth', async () => {
    let userName, pickSocialFields, alias, provider, avatar, id, new_session, postLocales;

    beforeEach(async () => {
      await dropDatabase();
      sinon.stub(axios, 'post').returns(Promise.resolve('OK'));
      id = new ObjectID().toString();
      userName = 'name';
      alias = 'alias';
      provider = 'facebook';
      avatar = 'image_url';
      pickSocialFields = false;
      postLocales = ['de-DE',
        'et-EE',
        'es-ES'];
      new_session = {
        sid: new ObjectID(),
        secret_token: crypto.SHA512(`${new Date()}`).toString(),
      };
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should create user with post locales if it exists', async () => {
      sinon.stub(OperationsHelper, 'transportAction').returns(Promise.resolve({ success: true }));
      const { user } = await AuthenticationModule.Auth.socialAuth({
        userName, pickSocialFields, alias, provider, avatar, id, postLocales,
      });

      expect(user.user_metadata.settings.postLocales).to.be.deep.eq(postLocales);
    });
    it('check sign up with valid data', async () => {
      sinon.stub(OperationsHelper, 'transportAction').returns(Promise.resolve({ success: true }));
      const { user, session, message } = await AuthenticationModule.Auth.socialAuth({
        userName, pickSocialFields, alias, provider, avatar, id,
      });

      expect(user).to.be.exist;
      expect(session).to.be.exist;
      expect(message).to.be.undefined;
      expect(user.auth.sessions.length).to.be.eq(1);
      expect(user.auth.provider).to.be.eq(provider);
      expect(user.auth.sessions[0].sid).to.be.eql(session.sid.toString());
      expect(user.auth.sessions[0].secret_token).to.be.eq(session.secret_token);
      expect(user.name).to.be.eq(userName);
      expect(user.alias).to.be.eq(alias);
    });

    it('check sign up with true pickSocialFields', async () => {
      sinon.stub(OperationsHelper, 'transportAction').returns(Promise.resolve({ success: true }));
      sinon.stub(Requests, 'uploadAvatar').returns(Promise.resolve('image_url'));
      pickSocialFields = true;
      const { user, session, message } = await AuthenticationModule.Auth.socialAuth({
        userName, pickSocialFields, alias, provider, avatar, id,
      });
      const metadata = {
        profile: {
          name: alias,
          profile_image: 'image_url',
          // facebook: null
          // facebook: id
        },
      };

      expect(user).to.be.exist;
      expect(session).to.be.exist;
      expect(message).to.be.undefined;
      expect(user.auth.sessions.length).to.be.eq(1);
      expect(user.json_metadata).to.be.eql(JSON.stringify(metadata));
      expect(user.auth.provider).to.be.eq(provider);
      expect(user.auth.sessions[0].sid).to.be.eql(session.sid.toString());
      expect(user.auth.sessions[0].secret_token).to.be.eq(session.secret_token);
      expect(user.name).to.be.eq(userName);
      expect(user.alias).to.be.eq(alias);
    });

    it('check sign up with exist user', async () => {
      sinon.stub(OperationsHelper, 'transportAction').returns(Promise.resolve({ success: true }));
      await UserFactory.create({ name: userName, auth: { sessions: [] } });
      const { user, session, message } = await AuthenticationModule.Auth.socialAuth({
        userName, pickSocialFields, alias, provider, avatar, id,
      });

      expect(user).to.be.undefined;
      expect(session).to.be.undefined;
      expect(message).to.be.exist;
      expect(message).to.be.eq('User exist');
    });

    it('check sign up without user name', async () => {
      sinon.stub(OperationsHelper, 'transportAction').returns(Promise.resolve({ success: true }));
      const { user, session, message } = await AuthenticationModule.Auth.socialAuth({
        userName: null, pickSocialFields, alias, provider, avatar, id,
      });

      expect(user).to.be.undefined;
      expect(session).to.be.undefined;
      expect(message).to.be.exist;
      expect(message).to.be.eq('Invalid data fields');
    });

    it('check sign in with valid data', async () => {
      await UserFactory.create({ name: userName, auth: { provider: 'facebook', id, sessions: [] } });
      const { user, session, message } = await AuthenticationModule.Auth.socialAuth({
        userName, pickSocialFields, alias, provider, avatar, id,
      });

      expect(user).to.be.exist;
      expect(session).to.be.exist;
      expect(message).to.be.undefined;
      expect(user.auth.sessions.length).to.be.eq(1);
    });

    it('check sign in with invalid provider', async () => {
      await UserFactory.create({ name: userName, auth: { provider: 'aaaa', id, sessions: [] } });
      const { user, session, message } = await AuthenticationModule.Auth.socialAuth({
        userName, pickSocialFields, alias, provider, avatar, id,
      });

      expect(user).to.be.undefined;
      expect(session).to.be.undefined;
      expect(message).to.be.exist;
      expect(message).to.be.eq('User exist');
    });
  });
});
