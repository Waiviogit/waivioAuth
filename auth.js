const passport = require('passport');
const session = require('express-session');

module.exports = function (app) {
  app.use(session(
    {
      secret: '4fbee263df91179dcebf011c73fa74b5',
      cookie: { maxAge: 60000 },
      resave: true,
      saveUninitialized: true,
    },
  )); // session secret

  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
};
