/**
 * Middleware for handling errors.
 * @param {Error} err - The error object.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const errorHandler = (err, req, res, next) => {
  const time = new Date();
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
  // Log the error for debugging
  console.error("------");
  console.error(`${time.toLocaleString()}: ${err.stack}`);
};

export default errorHandler;
