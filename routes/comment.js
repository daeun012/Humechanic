var express = require('express');
var router = express.Router();
var Comment = require('../models/Comment');
var Board = require('../models/Board');
var util = require('../util');

// create
router.post('/create', util.isLoggedin, checkBoardId, function (req, res) {
  let board = res.locals.board;

  req.body.author = req.user._id;
  req.body.board = board._id;

  Comment.create(req.body, function (err, comment) {
    if (err) {
      req.flash('commentForm', { _id: null, form: req.body });
      req.flash('commentError', { _id: null, errors: util.parseError(err) });
    }
    return res.redirect('/board/' + board._id);
  });
});

router.put('/update/:id', util.isLoggedin, checkPermission, checkBoardId, function (req, res) {
  console.log('update');
  let board = res.locals.board;

  req.body.updatedAt = Date.now();
  Comment.findOneAndUpdate({ _id: req.params.id }, req.body, { runValidators: true }, function (err, comment) {
    if (err) {
      console.log(err);
      req.flash('commentForm', { _id: req.params.id, form: req.body });
      req.flash('commentError', { _id: req.params.id, errors: util.parseError(err) });
    }
    return res.redirect('/board/' + board._id);
  });
});

router.delete('/delete/:id', util.isLoggedin, checkPermission, checkBoardId, function (req, res) {
  let board = res.locals.board;

  Comment.findOne({ _id: req.params.id }, function (err, comment) {
    if (err) return res.json(err);

    // save updated comment
    comment.isDeleted = true;
    comment.save(function (err, comment) {
      if (err) return res.json(err);

      return res.redirect('/board/' + board._id);
    });
  });
});

module.exports = router;

function checkPermission(req, res, next) {
  Comment.findOne({ _id: req.params.id }, function (err, comment) {
    if (err) return res.json(err);
    if (comment.author != req.user.id) return util.noPermission(req, res);

    next();
  });
}

function checkBoardId(req, res, next) {
  Board.findOne({ _id: req.query.boardId }, function (err, board) {
    if (err) return res.json(err);

    res.locals.board = board; // 1-1
    next();
  });
}
module.exports = router;
