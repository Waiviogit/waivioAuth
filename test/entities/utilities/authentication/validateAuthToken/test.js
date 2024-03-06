const {
  sinon, AuthenticationModule, expect, mockRequest, mockResponse, dropDatabase, jwt,
} = require('../../../../testHelper');
const { UserFactory, TokenFactory } = require('../../../../factories');

describe('auth', async () => {
  describe('validate_auth_token', async () => {
    let user;
    let next;

    beforeEach(async () => {
      await dropDatabase();
      user = await UserFactory.create({ email: 'user@com.ua', password: 'pass' });
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return success with all valid params', async () => {
      const { session, auth_token } = await TokenFactory.create({ client: user });

      await user.set({ auth: { sessions: [session] } });
      await user.save();
      const req = mockRequest({ headers: { 'access-token': auth_token } });
      const res = mockResponse();

      next = () => {
        res.status.args[0] = 200;
      };

      await AuthenticationModule.ValidataAuthToken.validateAuthToken(req, res, next);

      expect(res.status.args[0]).to.be.eql(200);
    });

    it('should return success with expire valid user token', async () => {
      const { session, auth_token } = await TokenFactory.create({ client: user });

      await user.set({ auth: { sessions: [session] } });
      await user.save();
      const req = mockRequest({ headers: { 'access-token': auth_token } });
      const res = mockResponse();

      next = () => {
        res.status.args[0] = 200;
      };
      await new Promise((resolve) => setTimeout(resolve, 2200));
      await AuthenticationModule.ValidataAuthToken.validateAuthToken(req, res, next);

      expect(res.status.args[0]).to.be.eql(200);
    });

    it('should return unauthorize with invalid token', async () => {
      const { session } = await TokenFactory.create({ client: user });

      await user.set({ auth: { sessions: [session] } });
      await user.save();
      const req = mockRequest({ headers: { 'access-token': 'asdasd' } });
      const res = mockResponse();

      next = () => {
        res.status.args[0] = 200;
      };
      await AuthenticationModule.ValidataAuthToken.validateAuthToken(req, res, next);

      expect(res.status.args[0][0]).to.be.eq(401);
    });

    it('should return unauthorize without user auth object', async () => {
      const { auth_token } = await TokenFactory.create({ client: user });

      const req = mockRequest({ headers: { 'access-token': auth_token } });
      const res = mockResponse();

      next = () => {
        res.status.args[0] = 200;
      };
      await AuthenticationModule.ValidataAuthToken.validateAuthToken(req, res, next);

      expect(res.status.args[0][0]).to.be.eq(401);
    });

    it('should return unauthorize with empty token', async () => {
      const { session } = await TokenFactory.create({ client: user });

      await user.set({ auth: { sessions: [session] } });
      await user.save();
      const req = mockRequest({ headers: { 'auth-token': '' } });
      const res = mockResponse();

      next = () => {
        res.status.args[0] = 200;
      };
      await AuthenticationModule.ValidataAuthToken.validateAuthToken(req, res, next);

      expect(res.status.args[0][0]).to.be.eq(401);
    });

    it('should return unauthorize without token', async () => {
      const { session } = await TokenFactory.create({ client: user });

      await user.set({ auth: { sessions: [session] } });
      await user.save();
      const req = mockRequest({ headers: { } });
      const res = mockResponse();

      next = () => {
        res.status.args[0] = 200;
      };
      await AuthenticationModule.ValidataAuthToken.validateAuthToken(req, res, next);

      expect(res.status.args[0][0]).to.be.eq(401);
    });

    it('should return unauthorize with another token', async () => {
      const another_user = await UserFactory.create({ email: 'user@com.ua', password: 'pass' });
      const { session } = await TokenFactory.create({ client: user });
      const anotherUserSession = await TokenFactory.create({ client: another_user });

      await user.set({ auth: { sessions: [session] } });
      await user.save();
      const req = mockRequest({ headers: { 'access-token': anotherUserSession.auth_token } });
      const res = mockResponse();

      next = () => {
        res.status.args[0] = 200;
      };
      await AuthenticationModule.ValidataAuthToken.validateAuthToken(req, res, next);

      expect(res.status.args[0][0]).to.be.eq(401);
    });

    it('should return unauthorize with jwt decoding error', async () => {
      const { session, auth_token } = await TokenFactory.create({ client: user });

      sinon.stub(jwt, 'decode').returns({ id: user._id, sid: session.sid.toString(), data: 'invalid_data' });
      sinon.stub(AuthenticationModule.TokenSalt, 'decodeToken').returns('invalid_data');

      await user.set({ auth: { sessions: [session] } });
      await user.save();
      const req = mockRequest({ headers: { 'access-token': auth_token } });
      const res = mockResponse();

      next = () => {
        res.status.args[0] = 200;
      };
      await AuthenticationModule.ValidataAuthToken.validateAuthToken(req, res, next);

      expect(res.status.args[0][0]).to.be.eq(401);
    });
  });
  describe('verify_auth_token', async () => {
    let user;
    let next;

    beforeEach(async () => {
      user = await UserFactory.create({ email: 'user@com.ua', password: 'pass' });
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return success with all valid params', async () => {
      const { session, auth_token } = await TokenFactory.create({ client: user });

      await user.set({ auth: { sessions: [session] } });
      await user.save();
      const req = mockRequest({ headers: { 'access-token': auth_token } });
      const res = mockResponse();

      next = () => {
        res.status.args[0] = 200;
      };

      await AuthenticationModule.ValidataAuthToken.verifyAuthToken(req, res, next);

      expect(res.status.args[0]).to.be.eql(200);
    });

    it('should return success with expire valid user token', async () => {
      const { session, auth_token } = await TokenFactory.create({ client: user });

      await user.set({ auth: { sessions: [session] } });
      await user.save();
      const req = mockRequest({ headers: { 'access-token': auth_token } });
      const res = mockResponse();

      next = () => {
        res.status.args[0] = 200;
      };
      await new Promise((resolve) => setTimeout(resolve, 2200));
      await AuthenticationModule.ValidataAuthToken.verifyAuthToken(req, res, next);

      expect(res.status.args[0][0]).to.be.eq(401);
    });

    it('should return unauthorize with invalid token', async () => {
      const { session } = await TokenFactory.create({ client: user });

      await user.set({ auth: { sessions: [session] } });
      await user.save();
      const req = mockRequest({ headers: { 'access-token': 'asdasd' } });
      const res = mockResponse();

      next = () => {
        res.status.args[0] = 200;
      };
      await AuthenticationModule.ValidataAuthToken.verifyAuthToken(req, res, next);

      expect(res.status.args[0][0]).to.be.eq(401);
    });

    it('should return unauthorize without user auth object', async () => {
      const { auth_token } = await TokenFactory.create({ client: user });

      const req = mockRequest({ headers: { 'access-token': auth_token } });
      const res = mockResponse();

      next = () => {
        res.status.args[0] = 200;
      };
      await AuthenticationModule.ValidataAuthToken.verifyAuthToken(req, res, next);

      expect(res.status.args[0][0]).to.be.eq(401);
    });

    it('should return unauthorize with empty token', async () => {
      const { session } = await TokenFactory.create({ client: user });

      await user.set({ auth: { sessions: [session] } });
      await user.save();
      const req = mockRequest({ headers: { 'auth-token': '' } });
      const res = mockResponse();

      next = () => {
        res.status.args[0] = 200;
      };
      await AuthenticationModule.ValidataAuthToken.verifyAuthToken(req, res, next);

      expect(res.status.args[0][0]).to.be.eq(401);
    });

    it('should return unauthorize without token', async () => {
      const { session } = await TokenFactory.create({ client: user });

      await user.set({ auth: { sessions: [session] } });
      await user.save();
      const req = mockRequest({ headers: { } });
      const res = mockResponse();

      next = () => {
        res.status.args[0] = 200;
      };
      await AuthenticationModule.ValidataAuthToken.verifyAuthToken(req, res, next);

      expect(res.status.args[0][0]).to.be.eq(401);
    });

    it('should return unauthorize with another token', async () => {
      const another_user = await UserFactory.create({ email: 'user@com.ua', password: 'pass' });
      const { session } = await TokenFactory.create({ client: user });
      const anotherUserSession = await TokenFactory.create({ client: another_user });

      await user.set({ auth: { sessions: [session] } });
      await user.save();
      const req = mockRequest({ headers: { 'access-token': anotherUserSession.auth_token } });
      const res = mockResponse();

      next = () => {
        res.status.args[0] = 200;
      };
      await AuthenticationModule.ValidataAuthToken.verifyAuthToken(req, res, next);

      expect(res.status.args[0][0]).to.be.eq(401);
    });

    it('should return unauthorize with jwt decoding error', async () => {
      const { session, auth_token } = await TokenFactory.create({ client: user });

      sinon.stub(jwt, 'decode').returns({ id: user._id, sid: session.sid.toString(), data: 'invalid_data' });
      sinon.stub(AuthenticationModule.TokenSalt, 'decodeToken').returns('invalid_data');

      await user.set({ auth: { sessions: [session] } });
      await user.save();
      const req = mockRequest({ headers: { 'access-token': auth_token } });
      const res = mockResponse();

      next = () => {
        res.status.args[0] = 200;
      };
      await AuthenticationModule.ValidataAuthToken.verifyAuthToken(req, res, next);

      expect(res.status.args[0][0]).to.be.eq(401);
    });
  });
});
