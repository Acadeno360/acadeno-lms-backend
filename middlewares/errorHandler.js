import logger from '../utils/logger.js'

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.statusCode || 500} - ${err.message} - ${req.originalUrl}`);

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && !err.isOperational
      ? 'Something went wrong'
      : err.message;

  res.status(statusCode).json({
    status: err.status || 'error',
    message,
  });
};


export default errorHandler
