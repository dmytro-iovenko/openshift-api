import { Deployment } from "../types/Deployment";

/**
 * Calculates the counts of deployment statuses from a list of deployments.
 *
 * @param {Deployment[]} deployments - The array of deployments to evaluate.
 * @returns - An object containing the counts of each deployment status.
 */
export const calculateDeploymentStatuses = (deployments: Deployment[]) => {
  const statusCounts = {
    Available: 0,
    NotAvailable: 0,
    NotProgressing: 0,
    Pending: 0,
  };

  // Iterate through each deployment and count statuses
  deployments.forEach((dep) => {
    switch (dep.status) {
      case "Available":
        statusCounts.Available++;
        break;
      case "Not Available":
        statusCounts.NotAvailable++;
        break;
      case "Not Progressing":
        statusCounts.NotProgressing++;
        break;
      default:
        statusCounts.Pending++;
        break;
    }
  });

  return statusCounts;
};
