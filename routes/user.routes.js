const express = require('express');

// Controllers
const {
  signUp,
  logIn,
  getUserProducts,
  updateUser,
  deleteUser,
  getUserPurchases,
  getUserPurchaseById,
} = require('../controllers/user.controller');

// Middlewares
const { createUserValidators } = require('../middlewares/validators.middleware');
const { protectSession, protectAccount } = require('../middlewares/auth.middleware');
const { userExists } = require('../middlewares/user.middleware');
const { orderExists } = require('../middlewares/order.middleware');

// Router
const userRouter = express.Router();

userRouter.post('/', createUserValidators, signUp);

userRouter.post('/login', logIn);

userRouter.use(protectSession);

userRouter.get('/me', getUserProducts);

userRouter
  .route('/:id')
  .patch(userExists, protectAccount, updateUser)
  .delete(userExists, protectAccount, deleteUser);

userRouter.get('/orders', getUserPurchases);

userRouter.get('/orders/:id', orderExists, getUserPurchaseById);

module.exports = { userRouter };
