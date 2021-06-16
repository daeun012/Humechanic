let express = require('express');
let router = express.Router();
let User = require('../models/User');
let passport = require('../config/passport');
var util = require('../util');

// create
router.post('/register', function (req, res) {
  User.create(req.body, function (err, user) {
    console.log(req.body);
    if (err) {
      console.log(err);
      req.flash('user', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/register');
    }
    res.redirect('/login');
  });
});

router.post(
  '/login',
  function (req, res, next) {
    let errors = {};
    let isValid = true;

    if (!req.body.username) {
      isValid = false;
      errors.username = 'Username is required!';
    }
    if (!req.body.password) {
      isValid = false;
      errors.password = 'Password is required!';
    }

    if (isValid) {
      next();
    } else {
      req.flash('errors', errors);
      res.redirect('/login');
    }
  },

  passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
  })
);

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
