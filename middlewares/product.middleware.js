// Model
const { Product } = require('../models/product.model');
const { ProductImg } = require('../models/ProductImg.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.utili');
const { AppError } = require('../utils/appError.util');

const productExists = catchAsync(async (req, res, next) => {
  const { id, productId: idProduct } = req.params;
  const { productId } = req.body;

  const product = await Product.findOne({
    where: {
      id: id || productId || idProduct,
      status: 'active',
    },
    include: ProductImg,
  });

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  req.product = product;

  next();
});

const validateProductOwner = (req, res, next) => {
  const { sessionUser, product } = req;

  if (sessionUser.id !== product.userId) {
    return next(new AppError('You are not the owner of this product', 403));
  }

  next();
};

module.exports = { productExists, validateProductOwner };
