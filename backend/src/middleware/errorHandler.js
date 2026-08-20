const logger = require('../config/logger');

/**
 * Custom Operational Application Error Class
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handles Mongoose CastError (e.g. invalid ObjectId)
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handles Mongoose Duplicate Key Error (code 11000)
 */
const handleDuplicateFieldsDB = (err) => {
  let field = 'field';
  let value = '';

  if (err.keyValue) {
    field = Object.keys(err.keyValue)[0];
    value = err.keyValue[field];
  } else if (err.errmsg) {
    const match = err.errmsg.match(/(["'])(\\?.)*?\1/);
    value = match ? match[0] : '';
  }

  const message = `Duplicate value: "${value}" for field "${field}". Please use another value.`;
  return new AppError(message, 400);
};

/**
 * Handles Mongoose Schema Validation Errors
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handles JWT Invalid Signature Error
 */
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

/**
 * Handles JWT Expired Error
 */
const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again.', 401);

/**
 * Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.statusCode = err.statusCode || 500;

  // Log error using Winston
  logger.error(
    `[${req.method}] ${req.originalUrl} - Status: ${error.statusCode} - ${err.message}`,
    { stack: err.stack }
  );

  // Mongoose Bad ObjectId
  if (err.name === 'CastError') error = handleCastErrorDB(err);

  // Mongoose Duplicate Key
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);

  // Mongoose Validation Error
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);

  // JWT Errors
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  const statusCode = error.statusCode || 500;
  const isDev = process.env.NODE_ENV === 'development';

  return res.status(statusCode).json({
    success: false,
    statusCode,
    error: error.message || 'Internal Server Error',
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = {
  AppError,
  errorHandler,
};
