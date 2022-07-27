// Model
const { Order } = require('../models/order.model');
const { Cart } = require('../models/cart.model');
const { ProductInCart } = require('../models/ProductInCart.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.utili');
const { AppError } = require('../utils/appError.util');

const orderExists = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findOne({
    where: { id },
    include: {
      model: Cart,
      include: ProductInCart,
    },
  });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  req.order = order;

  next();
});

module.exports = { orderExists };
