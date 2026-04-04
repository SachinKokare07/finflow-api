const logger = require('../utils/logger');

const handleCastError = (err) => ({
  statusCode: 400,
  message: `Invalid value for field '${err.path}': ${err.value}`,
});

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return {
    statusCode: 409,
    message: `An account with this ${field} already exists.`,
  };
};

const handleValidationError = (err) => ({
  statusCode: 422,
  message: Object.values(err.errors)
    .map((e) => e.message)
    .join('. '),
});

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'CastError') ({ statusCode, message } = handleCastError(err));
  if (err.code === 11000) ({ statusCode, message } = handleDuplicateKeyError(err));
  if (err.name === 'ValidationError') ({ statusCode, message } = handleValidationError(err));

  if (statusCode >= 500) {
    logger.error(`${err.message}`, { stack: err.stack, url: req.originalUrl });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFound };
