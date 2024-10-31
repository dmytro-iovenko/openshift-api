import React from "react";
import { Box } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Deployment } from "../../types/Deployment";
import Loader from "../Loader";

interface DeploymentTableProps {
  deployments: Deployment[];
  loading: boolean;
}

const DeploymentTable: React.FC<DeploymentTableProps> = ({ deployments, loading }) => {
  const columns: GridColDef[] = [
    { field: "name", headerName: "Deployment Name", width: 200 },
    { field: "status", headerName: "Status", width: 150 },
    { field: "createdAt", headerName: "Created At", width: 200 },
    { field: "updatedAt", headerName: "Updated At", width: 200 },
    { field: "namespace", headerName: "Namespace", width: 150 },
    { field: "replicas", headerName: "Replicas", width: 100 },
    { field: "availableReplicas", headerName: "Available", width: 100 },
    { field: "unavailableReplicas", headerName: "Unavailable", width: 100 },
    { field: "image", headerName: "Image", width: 200 },
    { field: "conditions", headerName: "Conditions", width: 200 },
  ];

  const rows = deployments.map((dep) => {
    const { spec, status } = dep.openShiftDetails;

    const totalReplicas = spec.replicas;
    const updatedReplicas = status.updatedReplicas;
    const unavailableReplicas = status.unavailableReplicas;

    const availableReplicas = updatedReplicas ? updatedReplicas - unavailableReplicas : 0;
    const overallStatus = calculateOverallStatus(dep);

    return {
      id: dep.name,
      name: dep.name,
      status: overallStatus,
      createdAt: new Date(dep.createdAt).toLocaleString(),
      updatedAt: new Date(dep.updatedAt).toLocaleString(),
      namespace: dep.openShiftDetails.metadata.namespace,
      replicas: totalReplicas,
      availableReplicas,
      unavailableReplicas,
      image: spec.template.spec.containers[0].image,
      conditions: status.conditions,
    };
  });

  return (
    <Box sx={{ height: 400, width: "100%" }}>
      {loading ? (
        <Loader /> // Show loader while fetching data
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          pagination
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5]}
        />
      )}
    </Box>
  );
};

const calculateOverallStatus = (deployment: Deployment): string => {
  const conditions = deployment.openShiftDetails.status.conditions || [];
  const availableCondition = conditions.find((cond) => cond.type === "Available");
  const progressingCondition = conditions.find((cond) => cond.type === "Progressing");

  if (availableCondition && availableCondition.status === "False") return "Not Available";
  if (progressingCondition && progressingCondition.status === "False") return "Not Progressing";
  return "Available";
};

export default DeploymentTable;
