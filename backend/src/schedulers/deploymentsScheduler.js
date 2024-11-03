import cron from "node-cron";
import Deployment from "../models/Deployment.js";
import { getOpenshiftDeployments } from "../services/openshiftApi.js";
import { updateDeploymentStatus } from "../utils/deploymentUtils.js";
import logger from "../utils/logger.js";

const jobName = "Deployment Status Update Job";

/**
 * Updates the status of deployments and other fields in MongoDB based on OpenShift data.
 */
const updateDeploymentsStatus = async () => {
  logger.info(`${jobName} started...`);

  try {
    const openShiftDeployments = await getOpenshiftDeployments();
    const openShiftDeploymentMap = {};

    // Map OpenShift deployments by name for quick access
    openShiftDeployments.items.forEach((deployment) => {
      openShiftDeploymentMap[deployment.metadata.name] = deployment;
    });

    const deployments = await Deployment.find();

    await Promise.all(
      deployments.map(async (deployment) => {
        const openShiftData = openShiftDeploymentMap[deployment.name] || null;

        if (openShiftData) {
          await updateDeploymentStatus(deployment, openShiftData, true);
        } else {
          // Only update the sync error fields if OpenShift data is not found
          if (deployment.lastSyncStatus !== "Not Found") {
            deployment.lastSyncStatus = "Not Found";
            deployment.syncError = "Deployment not found in OpenShift.";
            await deployment.save();
          }
        }
      })
    );

    logger.info(`${jobName} completed successfully`);
  } catch (error) {
    logger.error(`Failed to update deployment statuses in ${jobName}:`, error);
  }
};

// Define cron schedule and log the parameters
const cronSchedule = "*/5 * * * *"; // Every 5 minutes
cron.schedule(cronSchedule, updateDeploymentsStatus);

logger.info(`${jobName} scheduled with parameters: ${cronSchedule}`);
