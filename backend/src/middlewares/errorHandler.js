import logger from "../utils/logger.js";

/**
 * Middleware for handling errors.
 * @param {Error} err - The error object.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  if (status >= 500) {
    // Log server errors
    logger.error("Server Error:", {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      body: req.body,
    });
  } else {
    // Log client errors
    logger.warn("Client Error:", {
      message: err.message,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // Send error response
  res.status(status).json({ status, message });
};

export default errorHandler;
