import express from "express";
import authRoutes from "./routes/authRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import deploymentRoutes from "./routes/deploymentRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
import connectDB from "./config.js";
import cors from "cors";
import "dotenv/config";
import "./schedulers/deploymentsScheduler.js";
import logger from './utils/logger.js';

const app = express();
app.use(express.json());
app.use(cors());

// Basic route to check if the server is working
app.get("/", (req, res) => {
  res.json("It works!");
});

// Use auth routes for handling requests related to authentication
app.use("/api/auth", authRoutes);

// Use application routes for handling requests related to applications
app.use("/api/applications", applicationRoutes);

// Use deployment routes for handling requests related to deployments
app.use("/api/deployments", deploymentRoutes); 

// Connect to MongoDB
connectDB();

// Error handling middleware
app.use(errorHandler);

// Set the logger level based on the environment
logger.level = process.env.NODE_ENV === 'production' ? 'error' : 'debug';

const PORT = 5000;
app.listen(PORT, () => {
  logger.info("Server is running on port: " + PORT);
});
