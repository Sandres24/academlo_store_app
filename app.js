require('dotenv').config({ path: './config.env' });
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

// Routers
const { userRouter } = require('./routes/user.routes');
const { productRouter } = require('./routes/product.routes');
const { cartRouter } = require('./routes/cart.routes');

// Global err controller
const { globalErrorHandler } = require('./controllers/error.controller');

// Utils
const { AppError } = require('./utils/appError.util');

// Init express app
const app = express();

// Enable incoming JSON
app.use(express.json());

// Set template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Add security headers
app.use(helmet());

// Compress responses
app.use(compression());

// Log incoming requests
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
else app.use(morgan('combined'));

// Define endpoints
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/cart', cartRouter);

// Handle incoming unknown routes to the server
app.all('*', (req, res, next) => {
  next(new AppError(`${req.method} ${req.originalUrl} not found in this server`, 404));
});

// Handling incoming errors
app.use(globalErrorHandler);

module.exports = { app };
