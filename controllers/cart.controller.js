// Model
const { ProductInCart } = require('../models/ProductInCart.model');
const { Product } = require('../models/product.model');
const { Order } = require('../models/order.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.utili');
const { AppError } = require('../utils/appError.util');
const { Email } = require('../utils/email.util');

const addProductToCart = catchAsync(async (req, res, next) => {
  const { cart, product, productInCart } = req;
  const { productId, quantity } = req.body;

  let newProduct = null;

  if (productInCart && productInCart.status === 'active') {
    return next(new AppError('This product is already in the cart', 400));
  } else if (quantity > product.quantity) {
    return next(new AppError(`There is only ${product.quantity} units available`, 400));
  } else if (!productInCart) {
    newProduct = await ProductInCart.create({
      cartId: cart.id,
      productId,
      quantity,
    });
  } else if (productInCart && productInCart.status === 'removed' && quantity > 0) {
    newProduct = await productInCart.update({
      quantity: quantity,
      status: 'active',
    });
  }
  res.status(201).json({
    status: 'success',
    product: newProduct,
  });
});

const updateProductCart = catchAsync(async (req, res, next) => {
  const { product, productInCart } = req;
  const { newQty } = req.body;

  if (!productInCart) {
    return next(new AppError('This product is not in the cart', 404));
  } else if (newQty > product.quantity) {
    return next(new AppError(`There is only ${product.quantity} units available`, 400));
  } else if (productInCart.status === 'active' && newQty > 0) {
    await productInCart.update({ quantity: newQty });
  } else if (productInCart.status === 'active' && newQty === 0) {
    await productInCart.update({
      quantity: 0,
      status: 'removed',
    });
  } else if (productInCart.status === 'removed' && newQty > 0) {
    await productInCart.update({
      quantity: newQty,
      status: 'active',
    });
  }

  res.status(204).json({
    status: 'success',
  });
});

const deleteProductFromCart = catchAsync(async (req, res, next) => {
  const { productInCart } = req;

  await productInCart.update({
    quantity: 0,
    status: 'removed',
  });

  res.status(204).json({
    status: 'success',
  });
});

const purchase = catchAsync(async (req, res, next) => {
  const { sessionUser, cart } = req;
  let totalPrice = 0;

  if (!cart.productInCarts || cart.productInCarts.length === 0) {
    return next(new AppError('The cart does not have any product', 400));
  }

  const orderPromises = cart.productInCarts.map(async (productInCart) => {
    if (productInCart.status === 'removed') {
      return;
    }

    const product = await Product.findOne({ where: { id: productInCart.productId } });

    await product.update({
      quantity: product.quantity - productInCart.quantity,
    });

    totalPrice += productInCart.quantity * product.price;

    return await productInCart.update({ status: 'purchased ' });
  });

  await Promise.all(orderPromises);

  await cart.update({ status: 'purchased' });

  const order = await Order.create({
    userId: sessionUser.id,
    cartId: cart.id,
    totalPrice,
  });

  await new Email(sessionUser.email).sendPurchase(
    sessionUser.username,
    cart.productInCarts,
    totalPrice
  );

  res.status(201).json({
    status: 'success',
    order,
  });
});

module.exports = { addProductToCart, updateProductCart, deleteProductFromCart, purchase };
