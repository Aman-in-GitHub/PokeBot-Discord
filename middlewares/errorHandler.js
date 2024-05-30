import logger from '../logger.js';

function errorHandler(err, req, res, next) {
  logger.error('Error Handler Ran at', req.originalUrl);

  if (err.status) {
    return res.status(err.status).json({
      success: false,
      message: err.message
    });
  }

  res.status(500).json({
    success: false,
    message: err.message
  });
}

export default errorHandler;
