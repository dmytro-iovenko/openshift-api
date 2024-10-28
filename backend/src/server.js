import express from "express";
import cors from "cors";
import connectDB from './config.js';
import "dotenv/config";

const app = express();
app.use(express.json());
app.use(cors());

// Basic route to check if the server is working
app.get("/", (req, res) => {
  res.json("It works!");
});

// Connect to MongoDB
connectDB();

const PORT = 5000;
app.listen(PORT, () => {
  console.log("Server is running on port: " + PORT);
});
