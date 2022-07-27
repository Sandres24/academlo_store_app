const express = require('express');

// Controllers
const {
  createProduct,
  getAllActiveProducts,
  getActiveProduct,
  updateProduct,
  deleteProduct,
  getAllActiveCategories,
  createCategory,
  updateCategory,
} = require('../controllers/product.controller');

// Middlewares
const {
  createCategoryValidators,
  createProductValidators,
} = require('../middlewares/validators.middleware');
const { protectSession } = require('../middlewares/auth.middleware');
const { productExists, validateProductOwner } = require('../middlewares/product.middleware');
const { categoryExists } = require('../middlewares/category.middleware');

// Utils
const { upload } = require('../utils/upload.util');

// Router
const productRouter = express.Router();

productRouter.get('/categories', getAllActiveCategories);

productRouter.get('/', getAllActiveProducts);

productRouter.get('/:id', productExists, getActiveProduct);

productRouter.use(protectSession);

productRouter.post('/categories', createCategoryValidators, createCategory);

productRouter.patch('/categories/:id', categoryExists, updateCategory);

productRouter.post(
  '/',
  upload.array('imgUrl', 5),
  createProductValidators,
  categoryExists,
  createProduct
);

productRouter
  .use('/:id', productExists, validateProductOwner)
  .route('/:id')
  .patch(updateProduct)
  .delete(deleteProduct);

module.exports = { productRouter };
