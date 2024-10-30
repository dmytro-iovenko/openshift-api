/**
 * @file /D:/github/openshift-api/backend/src/models/Deployment.js
 * @description Mongoose model for the Deployment collection.
 */

import mongoose from "mongoose";

/**
 * Schema definition for the Deployment model.
 * This model represents a Deployment in OpenShift.
 * @typedef {Object} DeploymentSchema
 * @property {mongoose.Schema.Types.ObjectId} applicationId - Reference to the Application model.
 * @property {string} name - Name of the deployment.
 * @property {string} image - Image used for the deployment.
 * @property {string} status - Status of the deployment, defaults to "Pending".
 * @property {Date} createdAt - Timestamp when the deployment was created, defaults to current date and time.
 */

const DeploymentSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

/**
 * Deployment model based on the defined schema
 */
const Deployment = mongoose.model("Deployment", DeploymentSchema);
export default Deployment;
