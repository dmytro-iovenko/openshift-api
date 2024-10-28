import mongoose from "mongoose";

/**
 * Asynchronously connects to the MongoDB database using the connection URI
 * specified in the environment variable `MONGODB_URI`.
 * 
 * @async
 * @function connectDB
 * @returns {Promise<void>} Resolves when the connection is successful.
 * @throws Will log an error message and exit the process if the connection fails.
 */
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1); // Exit the process with failure
  }
}

export default connectDB;
