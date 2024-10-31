import { Deployment } from "../types/Deployment";

// Function to calculate the status counts for deployments
export const calculateDeploymentStatuses = (deployments: Deployment[]) => {
  const statusCounts = {
    Available: 0,
    NotAvailable: 0,
    NotProgressing: 0,
    Pending: 0,
  };

  deployments.forEach((dep) => {
    console.log(dep.status);
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
