import React from "react";
import { Box, Typography } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { Deployment } from "../../types/Deployment";
import { calculateDeploymentStatuses } from "../../helpers/statusHelpers";
import { statusColors } from "../../helpers/colors";

interface ApplicationPieChartProps {
  deployments: Deployment[];
}

const ApplicationStatusChart: React.FC<ApplicationPieChartProps> = ({ deployments }) => {
  const statusCounts = calculateDeploymentStatuses(deployments);

  const totalDeployments = deployments.length;
  const availableDeployments = statusCounts.Available;
  const notAvailableDeployments = statusCounts.NotAvailable;
  const notProgressingDeployments = statusCounts.NotProgressing;

  // Calculate health percentage
  const healthScore = availableDeployments * 1 - notAvailableDeployments * 2 - notProgressingDeployments * 0.5;
  const healthPercentage = totalDeployments > 0 ? (healthScore / (totalDeployments * 2)) * 100 : 0;

  // Determine color based on health percentage
  let healthColor = statusColors.available;
  if (healthPercentage < 50) {
    healthColor = statusColors.notAvailable;
  } else if (healthPercentage < 80) {
    healthColor = statusColors.notProgressing;
  }

  return (
    <Box sx={{ minWidth: "50px", minHeight: "50px", height: "50px", position: "relative" }}>
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
        <Typography variant="h5">{healthPercentage.toFixed(1)}</Typography>
        <Typography variant="body2">%</Typography>
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
