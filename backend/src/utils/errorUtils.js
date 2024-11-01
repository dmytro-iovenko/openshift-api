/**
 * Creates a new error object with a specified status and message.
 *
 * @param {number} status - The HTTP status code for the error.
 * @param {string} message - The error message.
 * @returns {Error} The created error object with the specified status and message.
 */
export default function error(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}
