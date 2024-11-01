/**
 * @file /D:/github/openshift-api/backend/src/models/Deployment.js
 * @description Mongoose model for the Deployment collection.
 */

import mongoose from "mongoose";

/**
 * Schema definition for the Deployment model.
 * This model represents a Deployment in OpenShift.
 *
 * @typedef {Object} DeploymentSchema
 * @property {mongoose.Schema.Types.ObjectId} applicationId - Reference to the Application model.
 * @property {string} name - Name of the deployment.
 * @property {string} image - Image used for the deployment.
 * @property {string} status - Status of the deployment, defaults to "Pending".
 * @property {Date} lastUpdated - Timestamp when the deployment was last update, defaults to current date and time.
 * @property {number} replicas - Total desired replicas.
 * @property {number} availableReplicas - Available replicas.
 * @property {number} unavailableReplicas - Unavailable replicas.
 * @property {number} updatedReplicas - Updated replicas.
 * @property {Array} conditions - Array of conditions for the deployment.
 * @property {string} strategy - Deployment strategy.
 * @property {number} revision - Current revision number.
 * @property {Date} createdAt - Timestamp when the deployment was created, defaults to current date and time.
 */
const DeploymentSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    status: { type: String, default: "Pending" },
    labels: { type: Map, of: String },
    replicas: { type: Number, default: 0 },
    availableReplicas: { type: Number, default: 0 },
    unavailableReplicas: { type: Number, default: 0 },
    updatedReplicas: { type: Number, default: 0 },
    conditions: [
      {
        type: { type: String },
        status: { type: String },
        lastTransitionTime: { type: Date },
        reason: { type: String },
        message: { type: String },
      },
    ],
    strategy: { type: String },
    revision: { type: Number },
    lastUpdated: { type: Date },
    lastSyncTime: { type: Date },
    lastSyncStatus: { type: String, default: "Unknown" },
    syncError: { type: String, default: "" },
  },
  { timestamps: true }
);

/**
 * Deployment model based on the defined schema
 */
const Deployment = mongoose.model("Deployment", DeploymentSchema);
export default Deployment;
