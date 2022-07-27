const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');

// Models
const { Product } = require('../models/product.model');
const { Category } = require('../models/category.model');
const { ProductImg } = require('../models/ProductImg.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.utili');
const { firebaseStorage } = require('../utils/firebase.util');

const createProduct = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { title, description, price, categoryId, quantity } = req.body;

  const product = await Product.create({
    title,
    description,
    quantity,
    price,
    categoryId,
    userId: sessionUser.id,
  });

  if (req.files.length > 0) {
    const productImgsPromises = req.files.map(async (file) => {
      const imgRef = ref(firebaseStorage, `products/${Date.now()}-${file.originalname}`);

      const imgRes = await uploadBytes(imgRef, file.buffer);

      return await ProductImg.create({
        imgUrl: imgRes.metadata.fullPath,
        productId: product.id,
      });
    });

    await Promise.all(productImgsPromises);
  }

  res.status(201).json({
    status: 'success',
    product,
  });
});

const getAllActiveProducts = catchAsync(async (req, res, next) => {
  const allProducts = await Product.findAll({
    where: { status: 'active' },
    include: ProductImg,
  });

  const productsPromises = allProducts.map(async (product) => {
    const productImgsPromises = product.productImgs.map(async (productImg) => {
      console.log(productImg);

      const imgRef = ref(firebaseStorage, productImg.imgUrl);

      const imgFullPath = await getDownloadURL(imgRef);

      return imgFullPath;
    });

    const productImgs = await Promise.all(productImgsPromises);

    const productCopy = { ...product.dataValues };

    productCopy.productImgs = productImgs;

    return productCopy;
  });

  const products = await Promise.all(productsPromises);

  res.status(200).json({
    status: 'success',
    products,
  });
});

const getActiveProduct = catchAsync(async (req, res, next) => {
  const { product } = req;

  const productImgsPromises = product.productImgs.map(async (productImg) => {
    const imgRef = ref(firebaseStorage, productImg.imgUrl);

    const imgFullPath = await getDownloadURL(imgRef);

    return imgFullPath;
  });

  const productImgs = await Promise.all(productImgsPromises);

  const productCopy = { ...product.dataValues };

  productCopy.productImgs = productImgs;

  res.status(200).json({
    status: 'success',
    product: productCopy,
  });
});

const updateProduct = catchAsync(async (req, res, next) => {
  const { product } = req;
  const { title, description, price, quantity } = req.body;

  await product.update({
    title,
    description,
    price,
    quantity,
  });

  res.status(204).json({
    status: 'success',
  });
});

const deleteProduct = catchAsync(async (req, res, next) => {
  const { product } = req;

  await product.update({ status: 'disabled' });

  res.status(204).json({
    status: 'success',
  });
});

const getAllActiveCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.findAll({ where: { status: 'active' } });

  res.status(200).json({
    status: 'success',
    categories,
  });
});

const createCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  const category = await Category.create({ name });

  res.status(201).json({
    status: 'success',
    category,
  });
});

const updateCategory = catchAsync(async (req, res, next) => {
  const { category } = req;
  const { name } = req.body;

  await category.update({ name });

  res.status(204).json({
    status: 'success',
  });
});

module.exports = {
  createProduct,
  getAllActiveProducts,
  getActiveProduct,
  updateProduct,
  deleteProduct,
  getAllActiveCategories,
  createCategory,
  updateCategory,
};
