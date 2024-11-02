import express from "express";
import {
  createApplication,
  getApplications,
  getApplication,
  deleteApplication,
  updateApplication,
} from "../controllers/applicationController.js";
import Application from "../models/Application.js";

const router = express.Router();

router.get('/generate-slugs', async (req, res) => {
  try {
    const applications = await Application.find();
    for (const app of applications) {
      // Check if the slug is already set
      if (!app.slug) {
        console.log(app);
        await app.save(); // Save the document to generate the slug
      }
    }

    res.status(200).json({ message: 'Slugs have been generated for all applications.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate slugs.', error });
  }
});

// Define routes for application management
router.post("/", createApplication); // Create a new application
router.get("/", getApplications); // Retrieve all applications
router.get('/:slug', getApplication); // Retrieve application by slug
router.delete("/:slug", deleteApplication); // Delete application by slug
router.patch("/:slug", updateApplication); // Update application by slug

export default router;
