require('dotenv').config({ path: './config' });
const jwt = require('jsonwebtoken');

// Model
const { User } = require('../models/user.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.utili');
const { AppError } = require('../utils/appError.util');

const protectSession = catchAsync(async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer')) {
    return next(new AppError('No token provided', 403));
  }

  const token = authorization.split(' ')[1];

  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findOne({ where: { id: decoded.id, status: 'active' } });

  if (!user) {
    return next(new AppError('The owner of this token does not exist anymore', 403));
  }

  req.sessionUser = user;

  next();
});

const protectAccount = (req, res, next) => {
  const { sessionUser, user } = req;

  if (sessionUser.id !== user.id) {
    return next(new AppError('You do not own this account', 403));
  }

  next();
};

module.exports = { protectSession, protectAccount };
