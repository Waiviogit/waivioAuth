module.exports = function ({ user, beaxyPayload }) {
  return {
    user: Object.assign(_.omit(user.auth, ['id', 'sessions']), _.omit(user, ['auth'])),
    payload: beaxyPayload,
  };
};
