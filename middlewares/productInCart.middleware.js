// Model
const { ProductInCart } = require('../models/ProductInCart.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.utili');

const productInCartExists = catchAsync(async (req, res, next) => {
  const { cart } = req;
  const { productId: id } = req.params;
  const { productId } = req.body;

  const productInCart = await ProductInCart.findOne({
    where: {
      cartId: cart.id,
      productId: id || productId,
    },
  });

  req.productInCart = productInCart;

  next();
});

module.exports = { productInCartExists };
