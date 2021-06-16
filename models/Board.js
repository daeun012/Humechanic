const mongoose = require('mongoose');
let Counter = require('../models/Counter');

// schema
const boardSchema = mongoose.Schema({
  title: { type: String, required: [true, 'Title is required!'] },
  desc: { type: String, required: [true, 'Description is required!'] },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 }, // 조회수
  numId: { type: Number }, // 글 번호
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

// 글 번호를 매기기 위해
boardSchema.pre('save', async function (next) {
  let board = this;
  if (board.isNew) {
    counter = await Counter.findOne({ name: 'bcounter' }).exec();
    if (!counter) counter = await Counter.create({ name: 'bcounter' });
    counter.count++;
    counter.save();
    board.numId = counter.count;
  }
  return next();
});

// model & export
const Board = mongoose.model('board', boardSchema);
module.exports = Board;
