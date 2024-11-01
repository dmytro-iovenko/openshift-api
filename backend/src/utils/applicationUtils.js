import Application from "../models/Application.js";
import { fetchAndUpdateDeploymentById } from "./deploymentUtils.js";

/**
 * Fetches all applications along with their deployments and updates their statuses.
 *
 * @returns {Promise<Array>} - An array of applications with updated deployment details.
 */
export const fetchApplicationsWithDeployments = async () => {
  try {
    const applications = await Application.find().populate("deployments");
    const updatedApplications = await Promise.all(
      applications.map(async (app) => {
        const updatedDeployments = await Promise.all(app.deployments.map(fetchAndUpdateDeploymentById));
        return {
          ...app.toObject(),
          deployments: updatedDeployments,
        };
      })
    );
    return updatedApplications;
  } catch (error) {
    console.error(`Failed to fetch applications with deployments: ${error.message}`);
    throw error;
  }
};
