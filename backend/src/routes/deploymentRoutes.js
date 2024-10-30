import express from "express";
import {
  createDeployment,
  getDeployments,
  updateDeployment,
  deleteDeployment,
} from "../controllers/deploymentController.js";

const router = express.Router({ mergeParams: true }); // Allow nested routing

router.post("/", createDeployment);
router.get("/", getDeployments);
router.patch("/:deploymentId", updateDeployment);
router.delete("/:deploymentId", deleteDeployment);

export default router;
