const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required!'],
    match: [/^.{4,12}$/, 'Should be 4-12 characters!'],
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required!'],
    match: [/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,16}$/, 'Should be minimum 8 characters of alphabet and number combination!'],
    select: false,
  },
});

userSchema.pre('save', function (next) {
  let user = this;
  user.password = bcrypt.hashSync(user.password);
  return next();
});

userSchema.methods.authenticate = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
