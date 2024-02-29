module.exports = function (data) {
  return {
    user: Object.assign(_.omit(data.user.auth, ['id', 'sessions']), _.omit(data.user, ['auth'])),
  };
};
