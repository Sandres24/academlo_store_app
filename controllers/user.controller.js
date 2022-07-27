require('dotenv').config({ path: './config.env' });
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Models
const { User } = require('../models/user.model');
const { Product } = require('../models/product.model');
const { Order } = require('../models/order.model');
const { Cart } = require('../models/cart.model');
const { ProductInCart } = require('../models/ProductInCart.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.utili');
const { AppError } = require('../utils/appError.util');
const { Email } = require('../utils/email.util');

const signUp = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  const salt = await bcryptjs.genSalt(12);

  const hashPassword = await bcryptjs.hash(password, salt);

  const user = await User.create({
    username,
    email,
    password: hashPassword,
  });

  user.password = undefined;

  await new Email(email).sendWellcome(username);

  res.status(201).json({
    status: 'success',
    user,
  });
});

const logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    where: {
      email,
      status: 'active',
    },
  });

  if (!user) {
    return next(new AppError('Wrong credentials', 400));
  }

  const isValidPassword = await bcryptjs.compare(password, user.password);

  if (!isValidPassword) {
    return next(new AppError('Wrong credentials', 400));
  }

  const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1day' });

  user.password = undefined;

  res.status(200).json({
    status: 'success',
    user,
    token,
  });
});

const getUserProducts = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const products = await Product.findAll({ where: { userId: sessionUser.id } });

  res.status(200).json({
    status: 'success',
    products,
  });
});

const updateUser = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { username, email } = req.body;

  await user.update({
    username,
    email,
  });

  res.status(204).json({
    status: 'success',
  });
});

const deleteUser = catchAsync(async (req, res, next) => {
  const { user } = req;

  await user.update({
    status: 'disabled',
  });

  res.status(204).json({
    status: 'success',
  });
});

const getUserPurchases = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const orders = await Order.findAll({
    where: {
      userId: sessionUser.id,
      status: 'purchased',
    },
    include: {
      model: Cart,
      include: ProductInCart,
    },
  });

  res.status(200).json({
    status: 'success',
    orders,
  });
});

const getUserPurchaseById = catchAsync(async (req, res, next) => {
  const { order } = req;

  res.status(200).json({
    status: 'success',
    order,
  });
});

module.exports = {
  signUp,
  logIn,
  getUserProducts,
  updateUser,
  deleteUser,
  getUserPurchases,
  getUserPurchaseById,
};
