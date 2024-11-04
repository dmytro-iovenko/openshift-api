import { v4 as uuidv4 } from "uuid";
import Deployment from "../models/Deployment.js";
import { checkOpenShiftDeploymentExists, getOpenshiftDeployment } from "../services/openshiftApi.js";
import error from "./errorUtils.js";

const MIN_UPDATE_INTERVAL = 5 * 60 * 1000;

/**
 * Generates a unique deployment name based on the application slug.
 * The name is constructed using the application slug followed by a unique identifier.
 * It checks both MongoDB and OpenShift to ensure the name is unique.
 *
 * @param {string} applicationSlug - The slug of the application to use as a base for the deployment name.
 * @returns {Promise<string>} - A promise that resolves to a unique deployment name.
 * @throws {Error} - Throws an error if there is an issue generating a unique name.
 */
export const generateUniqueDeploymentName = async (applicationSlug) => {
  let uniqueName;

  while (true) {
    const uniqueId = uuidv4().split("-")[0];
    uniqueName = `${applicationSlug}-${uniqueId}`;

    try {
      // Check MongoDB
      const existsInMongoDB = await Deployment.exists({ name: uniqueName });
      if (!existsInMongoDB) {
        // Check OpenShift if it's unique in MongoDB
        const existsInOpenShift = await checkOpenShiftDeploymentExists(uniqueName);
        if (!existsInOpenShift) {
          // If it's unique in both places, return it
          return uniqueName;
        }
      }
    } catch (error) {
      console.error(`Error while generating unique deployment name: ${error.message}`);
      throw new Error("Failed to generate a unique deployment name.");
    }
  }
};

/**
 * Updates the status of a deployment based on OpenShift data.
 *
 * @param {Object} deployment - The deployment to update.
 * @param {Object} openShiftData - The OpenShift deployment data.
 */
export const updateDeploymentStatus = async (deployment, openShiftData) => {
  let status = "Pending"; // Default status
  const { status: availableCondition } =
    openShiftData.status?.conditions?.find((cond) => cond.type === "Available") || {};
  const { status: progressingCondition } =
    openShiftData.status?.conditions?.find((cond) => cond.type === "Progressing") || {};
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
  deployment.revision =
    (openShiftData.metadata.annotations && openShiftData.metadata.annotations["deployment.kubernetes.io/revision"]) ||
    0;
  deployment.labels = {
    ...(openShiftData.metadata.labels || {}),
    ...(openShiftData.spec.template.metadata.labels || {}),
  };
  deployment.selector = openShiftData.spec.selector?.matchLabels || {};
  deployment.kind = openShiftData.kind;
  deployment.metadata = openShiftData.metadata;
  deployment.spec = openShiftData.spec;
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
      throw error(404, "Deployment not found");
    }
    return await fetchAndUpdateDeployment(deployment, forceRefresh);
  } catch (error) {
    console.error(`Failed to fetch and update deployment: ${error.message}`);
    throw error;
  }
};

export const fetchAndUpdateDeployment = async (deployment, forceRefresh = false) => {
  try {
    const openShiftData = await getOpenshiftDeployment(deployment.name);
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
