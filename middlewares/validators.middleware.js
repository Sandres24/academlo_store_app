const { body, validationResult } = require('express-validator');

// Utils
const { AppError } = require('../utils/appError.util');

const checkResult = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const msg = errors
      .array()
      .map((error) => error.msg)
      .join('. ');

    return next(new AppError(msg, 400));
  }

  next();
};

const createUserValidators = [
  body('username').notEmpty().withMessage('The username is requerid'),
  body('email')
    .notEmpty()
    .withMessage('The email is required')
    .isEmail()
    .withMessage('Provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('The password is require')
    .isLength({ min: 8 })
    .withMessage('The password must be at last 8 character long')
    .isAlphanumeric()
    .withMessage('The password must include letters and numbers'),
  checkResult,
];

const createCategoryValidators = [
  body('name').notEmpty().withMessage('The name of the category is required'),
  checkResult,
];

const createProductValidators = [
  body('title').notEmpty().withMessage('The title is required'),
  body('description').notEmpty().withMessage('The description is required'),
  body('price')
    .notEmpty()
    .withMessage('The price is required')
    .isInt()
    .withMessage('The price must be an integer'),
  body('categoryId')
    .notEmpty()
    .withMessage('The categoryId is required')
    .isInt()
    .withMessage('The categoryId must be an integer'),
  body('quantity')
    .notEmpty()
    .withMessage('The quantity is required')
    .isInt()
    .withMessage('The quantity must be an integer'),
  checkResult,
];

module.exports = {
  createUserValidators,
  createCategoryValidators,
  createProductValidators,
};
