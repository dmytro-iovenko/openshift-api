import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Application } from "../types/Application";
import { Deployment } from "../types/Deployment";
import { fetchDeployments } from "../services/api"; // Ensure this is the correct path to your API service

const ApplicationCard = ({
  application,
  onEdit,
  onDelete,
}: {
  application: Application;
  onEdit: () => void;
  onDelete: () => void;
}): JSX.Element => {
  const [openModal, setOpenModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
    fetchApplicationDeployments();
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const fetchApplicationDeployments = async () => {
    setLoading(true);
    try {
      const data = await fetchDeployments(application._id);
      setDeployments(data);
    } catch (error) {
      console.error("Failed to fetch deployments:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef<(typeof rows)[number]>[] = [
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

    const totalReplicas = spec.replicas; // Total desired replicas
    const updatedReplicas = status.updatedReplicas; // Successfully updated replicas
    const unavailableReplicas = status.unavailableReplicas; // Currently unavailable replicas

    // Calculate available replicas
    const availableReplicas = updatedReplicas ? updatedReplicas - unavailableReplicas : 0;

    // Determine the overall status
    let overallStatus = "Unknown";
    const conditions = dep.openShiftDetails.status.conditions || [];

    const availableCondition = conditions.find((cond) => cond.type === "Available");
    const progressingCondition = conditions.find((cond) => cond.type === "Progressing");

    if (availableCondition && availableCondition.status === "False") {
      overallStatus = "Not Available"; // Deployment is not available
    } else if (progressingCondition && progressingCondition.status === "False") {
      overallStatus = "Not Progressing"; // Deployment is not progressing
    } else if (availableReplicas > 0) {
      overallStatus = "Available"; // Deployment is available
    } else {
      overallStatus = dep.status; // Deployment is pending or in an unknown state
    }

    return {
      id: dep.name,
      name: dep.name,
      status: overallStatus,
      createdAt: new Date(dep.createdAt).toLocaleString(),
      updatedAt: new Date(dep.updatedAt).toLocaleString(),
      namespace: dep.openShiftDetails.metadata.namespace,
      replicas: totalReplicas,
      availableReplicas: availableReplicas,
      unavailableReplicas: unavailableReplicas,
      image: spec.template.spec.containers[0].image,
      conditions: status.conditions,
    };
  });

  return (
    <>
      <Card sx={{ maxWidth: 345, margin: 2 }}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {application.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Docker Image: {application.image}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Deployments: {application.deployments.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Created At: {new Date(application.createdAt).toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Updated At: {new Date(application.updatedAt).toLocaleString()}
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" color="primary" onClick={onEdit}>
            Edit
          </Button>
          <Button size="small" color="secondary" onClick={onDelete}>
            Delete
          </Button>
          <Button size="small" onClick={handleOpenModal}>
            Details
          </Button>
        </CardActions>
      </Card>

      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>{application.name} Details</DialogTitle>
        <DialogContent>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Basic Info" />
            <Tab label="Deployments" />
          </Tabs>
          <Box sx={{ marginTop: 2 }}>
            {activeTab === 0 && (
              <Box>
                <Typography variant="h6">Application Details</Typography>
                <Typography>Description: {application.description}</Typography>
                <Typography>Docker Image: {application.image}</Typography>
                <Typography>Deployments: {application.deployments.length}</Typography>
                <Typography>Created At: {new Date(application.createdAt).toLocaleString()}</Typography>
                <Typography>Updated At: {new Date(application.updatedAt).toLocaleString()}</Typography>
              </Box>
            )}
            {activeTab === 1 && (
              <Box sx={{ height: 400, width: "100%" }}>
                {loading ? (
                  <Typography>Loading deployments...</Typography>
                ) : (
                  <DataGrid
                    rows={rows}
                    columns={columns}
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
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ApplicationCard;
