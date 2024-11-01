import React, { useState } from "react";
import { Box, Chip, IconButton, Menu, MenuItem } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Loader from "../Loader";
import { Deployment } from "../../types/Deployment";

interface DeploymentTableProps {
  deployments: Deployment[];
  loading: boolean;
}

const DeploymentTable: React.FC<DeploymentTableProps> = ({ deployments, loading }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);

  const calculateAge = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);
    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(diffInSeconds / 3600);
    const days = Math.floor(diffInSeconds / 86400);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (minutes < 60) {
      return `${minutes} minutes ${diffInSeconds % 60} seconds ago`;
    } else if (hours < 24) {
      return `${hours} hours ${minutes % 60} minutes ago`;
    } else {
      return `${days} days ${hours % 24} hours ago`;
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, deployment: Deployment) => {
    setAnchorEl(event.currentTarget);
    setSelectedDeployment(deployment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDeployment(null);
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Deployment Name", flex: 1, minWidth: 150 },
    { field: "status", headerName: "Status", flex: 1, minWidth: 150 },
    { field: "availability", headerName: "Availability", flex: 1, minWidth: 150 },
    {
      field: "labels",
      headerName: "Labels",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box>
          {params.value.map((label: string, index: number) => (
            <Chip key={index} label={label} style={{ marginRight: 4 }} />
          ))}
        </Box>
      ),
    },
    {
      field: "podSelector",
      headerName: "Pod Selector",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box>
          {params.value.map((selector: string, index: number) => (
            <Chip key={index} label={selector} style={{ marginRight: 4 }} />
          ))}
        </Box>
      ),
    },
    { field: "age", headerName: "Age", flex: 1, minWidth: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 50,
      renderCell: (params) => (
        <IconButton onClick={(event) => handleMenuClick(event, params.row)}>
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  const rows = deployments.map((dep) => ({
    id: dep._id,
    name: dep.name,
    status: `${dep.availableReplicas} of ${dep.replicas} pods`,
    availability: dep.availableReplicas > 0 ? "Available" : "Not Available",
    labels: Object.entries(dep.labels).map(([key, value]) => `${key}=${value}`),
    podSelector: Object.entries(dep.selector).map(([key, value]) => `${key}=${value}`),
    age: calculateAge(dep.createdAt),
  }));

  return (
    <Box sx={{ height: "auto", width: "100%" }}>
      {loading ? (
        <Loader />
      ) : (
        <>
          <DataGrid
            rows={rows}
            columns={columns}
            pagination
            autoHeight
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            pageSizeOptions={[5]}
          />
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
            <MenuItem onClick={handleMenuClose}>Delete</MenuItem>
          </Menu>
        </>
      )}
    </Box>
  );
};

export default DeploymentTable;
