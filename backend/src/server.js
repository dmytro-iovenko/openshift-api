import express from "express";
import applicationRoutes from "./routes/applicationRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import connectDB from "./config.js";
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(express.json());
app.use(cors());

// Basic route to check if the server is working
app.get("/", (req, res) => {
  res.json("It works!");
});

// Use application routes for handling requests related to applications
app.use("/api/applications", applicationRoutes);

// Connect to MongoDB
connectDB();

// Error handling middleware
app.use(errorHandler);

const PORT = 5000;
app.listen(PORT, () => {
  console.log("Server is running on port: " + PORT);
});
