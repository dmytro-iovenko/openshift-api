// /src/utils/logger.js
import winston from "winston";

// Create a logger instance
const logger = winston.createLogger({
  level: "info", // Default logging level
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamp to logs
    winston.format.json() // Format logs as JSON
  ),
  transports: [
    new winston.transports.Console(), // Log to the console
    new winston.transports.File({ filename: "logs/error.log", level: "error" }), // Log error-level messages to a file
    new winston.transports.File({ filename: "logs/combined.log" }), // Log all messages to a separate file
  ],
});

// Export the logger
export default logger;
