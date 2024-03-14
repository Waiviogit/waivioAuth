const jwt = require('jsonwebtoken');
const config = require('../config');
const Requests = require('../utilities/helpers/api/requests');
const { User } = require('../database').models;
const { OperationsHelper } = require('../utilities/helpers');

const findUserBySocial = async ({ id, provider }) => User.findOne({ 'auth.provider': provider, 'auth.id': id });

const findUserById = async (id) => {
  try {
    return { user: await User.findOne({ _id: id }).lean() };
  } catch (error) {
    return { error };
  }
};

const findUserByName = async ({ name }) => User.findOne({ name });

const signUpSocial = async ({
  userName, alias, provider, avatar, id, postLocales, nightMode, email,
}) => {
  avatar = await Requests.uploadAvatar({ userName, imageUrl: avatar || 'https://waivio.nyc3.digitaloceanspaces.com/1591120767_bc441d85-3992-486c-8254-a09341a23003' });

  const metadata = JSON.stringify({ profile: { name: alias, profile_image: avatar, email } });
  const user = new User({
    name: userName,
    posting_json_metadata: metadata,
    json_metadata: metadata,
    alias,
    'auth.provider': provider,
    'auth.id': id,
  });

  user.user_metadata.settings.postLocales = postLocales;
  user.user_metadata.settings.nightmode = nightMode;
  user.user_metadata.settings.votingPower = false;

  try {
    await user.save();
    const access_token = prepareToken({ user });
    const { message } = await OperationsHelper.transportAction(userObjectCreate({
      userId: user.name,
      displayName: alias || '',
      posting_json_metadata: metadata,
      json_metadata: metadata,
      access_token,
    }));

    if (message) {
      await User.deleteOne({ _id: user._id });
      return { message };
    }
  } catch (err) {
    return { message: err };
  }

  return { user: user.toObject() };
};

const signInSocial = async ({ user_id }) => ({ user: await User.findOne({ _id: user_id }).select('+user_metadata').lean() });

const userObjectCreate = ({
  userId, displayName, posting_json_metadata, access_token, json_metadata,
}) => ({
  params: {
    id: 'waivio_guest_create',
    json: {
      userId, displayName, posting_json_metadata, json_metadata,
    },
  },
  access_token,
});

const prepareToken = ({ user }) => jwt.sign({ name: user.name, id: user._id }, process.env.ACCESS_KEY, { expiresIn: config.session_expiration });

module.exports = {
  signUpSocial,
  signInSocial,
  findUserByName,
  findUserBySocial,
  findUserById,
};
