let express = require('express');
let router = express.Router();
let Board = require('../models/Board');
let util = require('../util');
let Comment = require('../models/Comment');
// Index
router.get('/', async function (req, res) {
  let page = Math.max(1, parseInt(req.query.page));
  page = !isNaN(page) ? page : 1;

  let skip = (page - 1) * 10;
  let count = await Board.countDocuments({});
  let maxPage = Math.ceil(count / 10);

  let lists = await Board.find({}).populate('author').sort('-createdAt').skip(skip).limit(10).exec();
  res.render('board/index', {
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
  res.render('board/write', { list: list, errors: errors });
});

// create
router.post('/create', util.isLoggedin, function (req, res) {
  req.body.author = req.user._id;
  Board.create(req.body, function (err, list) {
    if (err) {
      console.log(err);
      req.flash('list', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/board/write');
    }
    res.redirect('/board');
  });
});

// views
router.get('/:id', function (req, res) {
  let commentForm = req.flash('commentForm')[0] || { _id: null, form: {} };
  let commentError = req.flash('commentError')[0] || { _id: null, parentComment: null, errors: {} };
  Promise.all([
    Board.findOne({ _id: req.params.id }).populate({ path: 'author', select: 'username' }),
    Comment.find({ board: req.params.id }).sort('createdAt').populate({ path: 'author', select: 'username' }),
  ])
    .then(([list, comments]) => {
      res.render('board/view', { list: list, comments: comments, commentForm: commentForm, commentError: commentError });
    })
    .catch((err) => {
      console.log('err: ', err);
      return res.json(err);
    });
});

// edit
router.get('/:id/edit', util.isLoggedin, checkPermission, function (req, res) {
  var list = req.flash('list')[0];
  var errors = req.flash('errors')[0] || {};
  if (!list) {
    Board.findOne({ _id: req.params.id }, function (err, list) {
      if (err) return res.json(err);
      res.render('board/edit', { list: list, errors: errors });
    });
  } else {
    list._id = req.params.id;
    res.render('board/edit', { list: list, errors: errors });
  }
});

// update
router.put('/update/:id', util.isLoggedin, checkPermission, function (req, res) {
  req.body.updatedAt = Date.now(); //2
  Board.findOneAndUpdate({ _id: req.params.id }, req.body, { runValidators: true }, function (err, list) {
    if (err) {
      req.flash('list', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/board/' + req.params.id + '/edit');
    }
    res.redirect('/board/' + req.params.id);
  });
});

// delete
router.delete('/delete/:id', util.isLoggedin, checkPermission, function (req, res) {
  Board.deleteOne({ _id: req.params.id }, function (err) {
    if (err) return res.json(err);
    res.redirect('/board');
  });
});

function checkPermission(req, res, next) {
  Board.findOne({ _id: req.params.id }, function (err, list) {
    if (err) return res.json(err);
    if (list.author != req.user.id) return util.noPermission(req, res);

    next();
  });
}

module.exports = router;
