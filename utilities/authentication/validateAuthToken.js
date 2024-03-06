const render = require('../../concerns/render');
const { UserModel } = require('../../models');
const Sessions = require('./sessions');
const { ObjectId } = require('mongoose').Types;

const verifyAuthToken = async (req, res, next) => {
  const accessToken = req.headers['access-token'];

  if (!accessToken) return render.unauthorized(res, 'Token not found');
  const { payload, access_token, error } = await Sessions.getAuthData({ access_token: accessToken });

  if (error) return render.unauthorized(res, error);

  const { user } = await UserModel.findUserById(new ObjectId(payload.id));
  if (!user) return render.unauthorized(res, 'User not exist');
  const { result } = Sessions.verifyToken({ access_token, secretKey: process.env.ACCESS_KEY });
  if (!result) return render.unauthorized(res);
  req.user = user;
  return next();
};

const refreshAccessToken = async (req, res, next) => {
  const refreshToken = req.headers['refresh-token'];

  if (!refreshToken) return render.unauthorized(res, 'Token not found');
  const { payload, error } = await Sessions.getAuthData({ access_token: refreshToken });
  if (error) return render.unauthorized(res, error);

  const { user } = await UserModel.findUserById(new ObjectId(payload.id));
  if (!user) return render.unauthorized(res, 'User not exist');

  const { result } = Sessions.verifyToken({ access_token: refreshToken, secretKey: process.env.REFRESH_KEY });
  if (!result) return render.unauthorized(res);
  req.user = user;
  return next();
};

module.exports = {
  verifyAuthToken,
  refreshAccessToken,
};
