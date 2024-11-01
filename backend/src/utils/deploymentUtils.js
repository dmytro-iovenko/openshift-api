import Deployment from "../models/Deployment.js";
import { getOpenshiftDeploymentDetails } from "../services/openshiftApi.js";

const MIN_UPDATE_INTERVAL = 5 * 60 * 1000;

/**
 * Updates the status of a deployment based on OpenShift data.
 *
 * @param {Object} deployment - The deployment to update.
 * @param {Object} openShiftData - The OpenShift deployment data.
 */
export const updateDeploymentStatus = async (deployment, openShiftData) => {
  let status = "Pending"; // Default status
  const { status: availableCondition } =
    openShiftData.status.conditions.find((cond) => cond.type === "Available") || {};
  const { status: progressingCondition } =
    openShiftData.status.conditions.find((cond) => cond.type === "Progressing") || {};
  const replicas = openShiftData.status.availableReplicas || 0;

  if (availableCondition === "False") {
    status = "Not Available"; // No available condition
  } else if (progressingCondition === "False") {
    status = "Not Progressing"; // Not progressing
  } else if (replicas > 0) {
    status = "Available"; // At least one available replica
  }

  // Update fields
  deployment.status = status;
  deployment.replicas = openShiftData.spec.replicas || 0;
  deployment.availableReplicas = openShiftData.status.availableReplicas || 0;
  deployment.unavailableReplicas = openShiftData.status.unavailableReplicas || 0;
  deployment.updatedReplicas = openShiftData.status.updatedReplicas || 0;
  deployment.conditions = openShiftData.status.conditions || [];
  deployment.strategy = openShiftData.spec.strategy.type || "";
  deployment.revision = openShiftData.metadata.annotations["deployment.kubernetes.io/revision"] || 0;
  deployment.labels = {
    ...(openShiftData.metadata.labels || {}),
    ...(openShiftData.spec.template.metadata.labels || {}),
  };
  deployment.selector = openShiftData.spec.selector?.matchLabels || {};
  deployment.lastUpdated = Date.now();

  // Update lastUpdated timestamp and sync status
  deployment.lastSyncStatus = "Success";
  deployment.lastSyncTime = new Date();

  await deployment.save();
};

/**
 * Fetches the OpenShift data for a given deployment and updates the deployment status.
 *
 * @param {string} deploymentId - The ID of the deployment to fetch and update.
 * @returns {Promise<Object>} - The updated deployment object with OpenShift details.
 * @throws {Error} - If the deployment is not found or if an error occurs while fetching data.
 */
export const fetchAndUpdateDeploymentById = async (deploymentId, forceRefresh = false) => {
  try {
    const deployment = await Deployment.findById(deploymentId);
    if (!deployment) {
      throw new Error("Deployment not found");
    }
    return await fetchAndUpdateDeployment(deployment, forceRefresh);
  } catch (error) {
    console.error(`Failed to fetch and update deployment: ${error.message}`);
    throw error;
  }
};

export const fetchAndUpdateDeployment = async (deployment, forceRefresh = false) => {
  try {
    const openShiftData = await getOpenshiftDeploymentDetails(deployment.name);
    const lastUpdatedTimestamp =
      deployment.lastUpdated instanceof Date ? deployment.lastUpdated.getTime() : Date.now() - MIN_UPDATE_INTERVAL + 1;
    const needsUpdate = forceRefresh || Date.now() - lastUpdatedTimestamp > MIN_UPDATE_INTERVAL;

    if (needsUpdate && openShiftData) {
      await updateDeploymentStatus(deployment, openShiftData);
    }

    return {
      ...deployment.toObject(),
      openShiftDetails: openShiftData,
    };
  } catch (error) {
    console.error(`Failed to fetch and update deployment: ${error.message}`);
    throw error;
  }
};
