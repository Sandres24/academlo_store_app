// Models
const { User } = require('../models/user.model');
const { Cart } = require('../models/cart.model');
const { Category } = require('../models/category.model');
const { Order } = require('../models/order.model');
const { Product } = require('../models/product.model');
const { ProductImg } = require('../models/ProductImg.model');
const { ProductInCart } = require('../models/ProductInCart.model');

const initModels = () => {
  // 1 User <--> M Order
  User.hasMany(Order, { foreignKey: 'userId' });
  Order.belongsTo(User);

  // 1 User <--> M Product
  User.hasMany(Product, { foreignKey: 'userId' });
  Product.belongsTo(User);

  // 1 User <--> 1 Cart
  User.hasOne(Product, { foreignKey: 'userId' });
  Product.belongsTo(User);

  // 1 Cart <---> 1 Order
  Cart.hasOne(Order, { foreignKey: 'cartId' });
  Order.belongsTo(Cart);

  // 1 Category <--> 1 Product
  Category.hasOne(Product, { foreignKey: 'categoryId' });
  Product.belongsTo(Category);

  // 1 Product <--> M ProductImg
  Product.hasMany(ProductImg, { foreignKey: 'productId' });
  ProductImg.belongsTo(Product);

  // 1 Product <--> 1 ProductInCart
  Product.hasOne(ProductInCart, { foreignKey: 'productId' });
  ProductInCart.belongsTo(Product);

  // 1 Cart <--> M ProductInCart
  Cart.hasMany(ProductInCart, { foreignKey: 'cartId' });
  ProductInCart.belongsTo(Cart);
};

module.exports = { initModels };
