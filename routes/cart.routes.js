const express = require('express');

// Controllers
const {
  addProductToCart,
  updateProductCart,
  deleteProductFromCart,
  purchase,
} = require('../controllers/cart.controller');

// Middlewares
const { protectSession } = require('../middlewares/auth.middleware');
const { cartExists } = require('../middlewares/cart.middleware');
const { productExists } = require('../middlewares/product.middleware');
const { productInCartExists } = require('../middlewares/productInCart.middleware');

// Router
const cartRouter = express.Router();

cartRouter.post('/purchase', protectSession, cartExists, purchase);

cartRouter.delete(
  '/:productId',
  protectSession,
  cartExists,
  productExists,
  productInCartExists,
  deleteProductFromCart
);

cartRouter.use(protectSession, cartExists, productExists, productInCartExists);

cartRouter.post('/add-product', addProductToCart);

cartRouter.patch('/update-cart', updateProductCart);

module.exports = { cartRouter };
