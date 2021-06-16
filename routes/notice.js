let express = require('express');
let router = express.Router();
let Notice = require('../models/Notice');
let util = require('../util');

// Index
router.get('/', async function (req, res) {
  let page = Math.max(1, parseInt(req.query.page));
  page = !isNaN(page) ? page : 1;

  let skip = (page - 1) * 10;
  let count = await Notice.countDocuments({});
  let maxPage = Math.ceil(count / 10);

  let lists = await Notice.find({}).populate('author').sort('-createdAt').skip(skip).limit(10).exec();
  res.render('notice/index', {
    lists: lists,
    currentPage: page,
    maxPage: maxPage,
    limit: 10, // 9
  });
});

// write
router.get('/write', util.isLoggedin, function (req, res) {
  var list = req.flash('list')[0] || {};
  var errors = req.flash('errors')[0] || {};
  res.render('notice/write', { list: list, errors: errors });
});

// create
router.post('/create', util.isLoggedin, function (req, res) {
  req.body.author = req.user._id;
  Notice.create(req.body, function (err, list) {
    if (err) {
      console.log(err);
      req.flash('list', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/notice/write');
    }
    res.redirect('/notice');
  });
});

// views
router.get('/:id', function (req, res) {
  Notice.findOne({ _id: req.params.id })
    .populate('author')
    .exec(function (err, list) {
      if (err) return res.json(err);
      list.views++;
      list.save();
      res.render('notice/view', { list: list });
    });
});

// edit
router.get('/:id/edit', util.isLoggedin, checkPermission, function (req, res) {
  var list = req.flash('list')[0];
  var errors = req.flash('errors')[0] || {};
  if (!list) {
    Notice.findOne({ _id: req.params.id }, function (err, list) {
      if (err) return res.json(err);
      res.render('notice/edit', { list: list, errors: errors });
    });
  } else {
    list._id = req.params.id;
    res.render('notice/edit', { list: list, errors: errors });
  }
});

// update
router.put('/update/:id', util.isLoggedin, checkPermission, function (req, res) {
  req.body.updatedAt = Date.now(); //2
  Notice.findOneAndUpdate({ _id: req.params.id }, req.body, { runValidators: true }, function (err, list) {
    if (err) {
      req.flash('list', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/notice/' + req.params.id + '/edit');
    }
    res.redirect('/notice/' + req.params.id);
  });
});

// delete
router.delete('/delete/:id', util.isLoggedin, checkPermission, function (req, res) {
  Notice.deleteOne({ _id: req.params.id }, function (err) {
    if (err) return res.json(err);
    res.redirect('/notice');
  });
});

function checkPermission(req, res, next) {
  Notice.findOne({ _id: req.params.id }, function (err, list) {
    if (err) return res.json(err);
    if (list.author != req.user.id) return util.noPermission(req, res);

    next();
  });
}

module.exports = router;
