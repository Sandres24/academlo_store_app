// Model
const { Category } = require('../models/category.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.utili');
const { AppError } = require('../utils/appError.util');

const categoryExists = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { categoryId } = req.body;

  const category = await Category.findOne({
    where: {
      id: id || categoryId,
      status: 'active',
    },
  });

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  req.category = category;

  next();
});

module.exports = { categoryExists };
