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
  res.status(status).json({ status, message });
  // Log the error for debugging
  console.error("------");
  console.error(`${new Date().toLocaleString()}: ${message}`);
  console.error(err.stack);
};

export default errorHandler;
