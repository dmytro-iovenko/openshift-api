import express from "express";
import { protect, authorizeRole, checkApplicationOwnership } from "../middlewares/authMiddleware.js";
import {
  createApplication,
  getApplications,
  getApplication,
  deleteApplication,
  updateApplication,
} from "../controllers/applicationController.js";
import Application from "../models/Application.js";
import { getDeploymentsForApplication } from "../controllers/applicationController.js";

const router = express.Router();

router.get("/generate-slugs", protect, authorizeRole(["admin"]), async (req, res) => {
  try {
    const applications = await Application.find();
    for (const app of applications) {
      // Check if the slug is already set
      if (!app.slug) {
        console.log(app);
        await app.save(); // Save the document to generate the slug
      }
    }

    res.status(200).json({ message: "Slugs have been generated for all applications." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate slugs.", error });
  }
});

// Define routes for application management
router.post("/", protect, authorizeRole(["admin", "user"]), createApplication); // Create a new application
router.get("/", protect, getApplications); // Retrieve all applications
router.get("/:slug", protect, checkApplicationOwnership, getApplication); // Retrieve application by slug
router.delete("/:slug", protect, authorizeRole(["admin"]), deleteApplication); // Delete application by slug
router.patch("/:slug", protect, authorizeRole(["admin", "user"]), updateApplication); // Update application by slug
router.get("/:slug/deployments", protect, getDeploymentsForApplication); // Retrieve application by slug

export default router;
