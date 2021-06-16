let express = require('express');
let router = express.Router();

// Home
router.get('/', function (req, res) {
  res.render('home/main');
});
router.get('/about', function (req, res) {
  res.render('home/about');
});
router.get('/project', function (req, res) {
  res.render('home/project');
});
router.get('/login', function (req, res) {
  let username = req.flash('username')[0];
  let errors = req.flash('errors')[0] || {};
  res.render('home/login', {
    username: username,
    errors: errors,
  });
});

router.get('/register', function (req, res) {
  let user = req.flash('user')[0] || {};
  let errors = req.flash('errors')[0] || {};
  console.log(user, errors);
  res.render('home/register', { user: user, errors: errors });
});

module.exports = router;
