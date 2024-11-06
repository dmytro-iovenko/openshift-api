import React from "react";
import { Box, Typography } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { Deployment } from "../../types/Deployment";
import { calculateDeploymentStatuses } from "../../helpers/statusHelpers";
import { statusColors } from "../../helpers/colors";

/**
 * Props for the ApplicationStatusChart component.
 *
 * @property {Deployment[]} deployments - The list of deployments to analyze.
 */
interface ApplicationPieChartProps {
  deployments: Deployment[];
}

/**
 * Renders a pie chart representing the status of application deployments.
 *
 * @param {ApplicationPieChartProps} props - Component properties.
 * @returns {JSX.Element} The rendered pie chart.
 */
const ApplicationStatusChart: React.FC<ApplicationPieChartProps> = ({ deployments }) => {
  const statusCounts = calculateDeploymentStatuses(deployments);

  const totalDeployments = deployments.length;
  const availableDeployments = statusCounts.Available;
  const notAvailableDeployments = statusCounts.NotAvailable;
  const notProgressingDeployments = statusCounts.NotProgressing;

  // Calculate health percentage
  const healthScore = availableDeployments * 1 - notAvailableDeployments * 2 - notProgressingDeployments * 0.5;
  const healthPercentage = totalDeployments > 0 ? (healthScore / totalDeployments) * 100 : 0;

  // Determine health status based on health percentage
  let healthStatus = "Healthy";
  let healthColor = statusColors.available;
  if (statusCounts.Pending === totalDeployments) {
    healthStatus = "N/A";
    healthColor = statusColors.pending;
  } else if (healthPercentage < 50) {
    healthStatus = "Critical";
    healthColor = statusColors.notAvailable;
  } else if (healthPercentage < 80) {
    healthStatus = "Warning";
    healthColor = statusColors.notProgressing;
  }

  return (
    <Box sx={{ minWidth: "50px", minHeight: "50px", height: "50px", position: "relative", ml: "60px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "end",
          justifyContent: "end",
          position: "absolute",
          width: 1,
          right: "0.7rem",
          color: healthColor,
        }}>
        <Typography variant="h5" sx={{ mr: "0.75rem" }}>
          {healthStatus}
        </Typography>
      </Box>
      <PieChart
        colors={[statusColors.pending, statusColors.notProgressing, statusColors.notAvailable, statusColors.available]}
        series={[
          {
            data: [
              { label: "Pending", value: statusCounts.Pending },
              { label: "Not Progressing", value: statusCounts.NotProgressing },
              { label: "Not Available", value: statusCounts.NotAvailable },
              { label: "Available", value: statusCounts.Available },
            ],
            innerRadius: 20,
            outerRadius: 25,
            paddingAngle: 5,
            cornerRadius: 5,
            startAngle: 0,
            endAngle: 260,
            cx: 20,
            cy: 20,
          },
        ]}
        slotProps={{
          legend: {
            hidden: true,
          },
        }}
      />
    </Box>
  );
};

export default ApplicationStatusChart;
