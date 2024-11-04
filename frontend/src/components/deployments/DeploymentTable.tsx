import React, { useState } from "react";
import { Box, Chip, IconButton, Menu, MenuItem } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Loader from "../Loader";
import { Deployment } from "../../types/Deployment";

/**
 * Represents the props for the DeploymentTable component.
 *
 * @property {Deployment[]} deployments - The list of deployments to display.
 * @property {boolean} loading - Indicates if the data is still loading.
 */
interface DeploymentTableProps {
  deployments: Deployment[];
  loading: boolean;
}

/**
 * Renders a table of deployments with their details.
 *
 * @param {DeploymentTableProps} props - Component properties.
 * @returns {JSX.Element} The rendered deployment table.
 */
const DeploymentTable: React.FC<DeploymentTableProps> = ({ deployments, loading }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);

  /**
   * Calculates the age of a deployment based on its creation date.
   */
  const calculateAge = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);
    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(diffInSeconds / 3600);
    const days = Math.floor(diffInSeconds / 86400);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    } else if (minutes < 60) {
      return `${minutes}m ${diffInSeconds % 60}s`;
    } else if (hours < 24) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${days}d ${hours % 24}h`;
    }
  };

  /**
   * Handles the opening of the action menu
   */
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, deployment: Deployment) => {
    setAnchorEl(event.currentTarget);
    setSelectedDeployment(deployment);
  };

  /**
   * Handles the closing of the action menu
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDeployment(null);
  };

  // Define columns for the data grid
  const columns: GridColDef[] = [
    { field: "name", headerName: "Deployment Name", flex: 1, minWidth: 100 },
    { field: "status", headerName: "Status", flex: 1, minWidth: 100 },
    { field: "availability", headerName: "Availability", flex: 1, minWidth: 100 },
    {
      field: "labels",
      headerName: "Labels",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <Box>
          {params.value.map((label: string) => (
            <Chip key={label} label={label} style={{ marginRight: 4 }} />
          ))}
        </Box>
      ),
    },
    // {
    //   field: "podSelector",
    //   headerName: "Pod Selector",
    //   flex: 1,
    //   minWidth: 150,
    //   renderCell: (params) => (
    //     <Box>
    //       {params.value.map((selector: string) => (
    //         <Chip key={selector} label={selector} style={{ marginRight: 4 }} />
    //       ))}
    //     </Box>
    //   ),
    // },
    { field: "age", headerName: "Age", flex: 1, minWidth: 50 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 50,
      renderCell: (params) => (
        <IconButton onClick={(event) => handleMenuClick(event, params.row)}>
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // Map deployments to rows for the data grid
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
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            pageSizeOptions={[5]}
          />
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
            <MenuItem onClick={handleMenuClose}>Delete</MenuItem>
          </Menu>
        </>
      )}
    </Box>
  );
};

export default DeploymentTable;
