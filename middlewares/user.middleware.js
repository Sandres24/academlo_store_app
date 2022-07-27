// Model
const { User } = require('../models/user.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.utili');
const { AppError } = require('../utils/appError.util');

const userExists = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findOne({ where: { id, status: 'active' } });

  if (!user) {
    return next(new AppError('No user found', 404));
  }

  req.user = user;

  next();
});

module.exports = { userExists };
