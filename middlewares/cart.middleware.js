// Model
const { Cart } = require('../models/cart.model');
const { ProductInCart } = require('../models/ProductInCart.model');
const { Product } = require('../models/product.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.utili');

const cartExists = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  let cart = await Cart.findOne({
    where: {
      userId: sessionUser.id,
      status: 'active',
    },
    include: {
      include: Product,
      model: ProductInCart,
      where: { status: 'active' },
      required: false,
    },
  });

  if (!cart) {
    cart = await Cart.create({ userId: sessionUser.id });
  }

  req.cart = cart;

  next();
});

module.exports = { cartExists };
