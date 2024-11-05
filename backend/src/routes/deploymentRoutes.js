import express from "express";
import { protect, authorizeRole, checkDeploymentOwnership } from "../middlewares/authMiddleware.js";
import {
  createDeployment,
  createDeploymentFromYaml,
  getDeployments,
  getDeployment,
  updateDeployment,
  deleteDeployment,
  scaleDeployment,
  getDeploymentHistory,
  rollbackDeployment,
} from "../controllers/deploymentController.js";

const router = express.Router();

// Deployment routes
router.post("/", protect, authorizeRole(["admin", "user"]), createDeployment); // Create a new deployment
router.post("/from-yaml", protect, authorizeRole(["admin", "user"]), createDeploymentFromYaml); // Create a deployment from YAML
router.get("/", protect, getDeployments); // Retrieve all deployments
router.get("/:deploymentId", protect, checkDeploymentOwnership, getDeployment); // Retrieve a specific deployment

// Protect the following routes with ownership checks
router.patch("/:deploymentId", protect, checkDeploymentOwnership, updateDeployment); // Update an existing deployment
router.delete("/:deploymentId", protect, checkDeploymentOwnership, deleteDeployment); // Delete a deployment

// Admin-only routes
router.patch("/:deploymentId/scale", protect, authorizeRole(["admin"]), scaleDeployment); // Scale a deployment
router.get("/:deploymentId/history", protect, authorizeRole(["admin"]), getDeploymentHistory); // Get deployment history
router.post("/:deploymentId/rollback", protect, authorizeRole(["admin"]), rollbackDeployment); // Rollback to a specific revision

export default router;
