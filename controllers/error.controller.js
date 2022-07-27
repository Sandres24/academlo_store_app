require('dotenv').config({ path: './config.env' });

// Utils
const { AppError } = require('../utils/appError.util');

const sendErrorDev = (err, req, res, next) => {
  console.dir(err);
  console.log(err.message);
  console.log(err.name);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    statusCode,
    status: err.status || 'fail',
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    status: err.status || 'fail',
    message: err.message || 'Something went wrong!',
  });
};

const handleUniqueEmailError = () => {
  return new AppError('The email you entered is already taken', 400);
};

const handleJWTExpiredError = () => {
  return new AppError('Your session has expired! Please login again.', 401);
};

const handleJWTError = () => {
  return new AppError('Invalid session. Please login again.', 401);
};

const handleImgExceedError = () => {
  return new AppError('You exceeded the number of images allowed', 400);
};

const globalErrorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res, next);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'SequelizeUniqueConstraintError') {
      error = handleUniqueEmailError();
    } else if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    } else if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      error = handleImgExceedError();
    }

    sendErrorProd(err, req, res, next);
  }
};

module.exports = { globalErrorHandler };
