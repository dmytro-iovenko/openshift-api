import express from "express";
import { createApplication, getApplications, deleteApplication, updateApplication } from "../controllers/applicationController.js";

const router = express.Router();

// Define routes for application management
router.post("/", createApplication); // Create a new application
router.get("/", getApplications); // Retrieve all applications
router.delete("/:id", deleteApplication); // Delete application by ID
router.patch("/:id", updateApplication); // Update application by ID

export default router;
