var mongoose = require('mongoose');

var commentSchema = mongoose.Schema({
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  text: { type: String, required: [true, 'text is required!'] },
  isDeleted: { type: Boolean },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

var Comment = mongoose.model('comment', commentSchema);
module.exports = Comment;
