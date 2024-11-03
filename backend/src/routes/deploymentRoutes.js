import express from "express";
import {
  createDeployment,
  createDeploymentFromYaml,
  getDeployments,
  getDeploymentDetails,
  updateDeployment,
  deleteDeployment,
  scaleDeployment,
  getDeploymentHistory,
  rollbackDeployment,
} from "../controllers/deploymentController.js";

const router = express.Router();

// Deployment routes
router.post("/", createDeployment); // Create a new deployment
router.post("/from-yaml", createDeploymentFromYaml); // Create a deployment from YAML
router.get("/", getDeployments); // Retrieve all deployments
router.get("/:deploymentId", getDeploymentDetails); // Get details of a specific deployment
router.patch("/:deploymentId", updateDeployment); // Update an existing deployment
router.delete("/:deploymentId", deleteDeployment); // Delete a deployment
router.patch("/:deploymentId/scale", scaleDeployment); // Scale a deployment
router.get("/:deploymentId/history", getDeploymentHistory); // Get deployment history
router.post("/:deploymentId/rollback", rollbackDeployment); // Rollback to a specific revision

export default router;
