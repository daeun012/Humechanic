var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
1;
var User = require('../models/User');

// login시 db에서 발견한 user 어떻게 session에 저장할지
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// request시 session에 어떻게 user object를 만들지
passport.deserializeUser(function (id, done) {
  User.findOne({ _id: id }, function (err, user) {
    done(err, user);
  });
});

passport.use(
  'local-login',
  new LocalStrategy(
    {
      usernameField: 'username', // 3-1
      passwordField: 'password', // 3-1
      passReqToCallback: true,
    },
    function (req, username, password, done) {
      // 3-2
      User.findOne({ username: username })
        .select({ password: 1 })
        .exec(function (err, user) {
          if (err) return done(err);

          if (user && user.authenticate(password)) {
            // 3-3
            return done(null, user);
          } else {
            req.flash('username', username);
            req.flash('errors', { login: 'The username or password is incorrect.' });
            return done(null, false);
          }
        });
    }
  )
);

module.exports = passport;
