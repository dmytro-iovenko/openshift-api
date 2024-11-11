import React, { useState } from "react";
import {
  Box,
  ListItemText,
  IconButton,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  OutlinedInput,
  InputAdornment,
  Checkbox,
  CircularProgress,
  Menu,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import CachedIcon from "@mui/icons-material/Cached";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Loader from "../Loader";
import { Deployment } from "../../types/Deployment";
import { DeploymentTableProps } from "./DeploymentTable";

// Helper functions
const calculateAge = (createdAt: string) => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);
  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(diffInSeconds / 3600);
  const days = Math.floor(diffInSeconds / 86400);

  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (minutes < 60) return `${minutes}m ${diffInSeconds % 60}s`;
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  return `${days}d ${hours % 24}h`;
};

const DeploymentList: React.FC<DeploymentTableProps> = ({
  deployments,
  loading,
  onEdit,
  onDelete,
  onRefresh,
  IsDeplRefreshing,
  isRefreshing,
}) => {
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>({});
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<string | null>(null);

  // Handle filter menu
  const openFilterMenu = (event: React.MouseEvent<HTMLElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const closeFilterMenu = () => {
    setFilterMenuAnchor(null);
  };

  const applyColumnFilter = (column: string, values: string[]) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [column]: values,
    }));
  };

  const resetColumnFilter = (column: string) => {
    setSelectedFilters((prev) => {
      const updatedFilters = { ...prev };
      delete updatedFilters[column];
      return updatedFilters;
    });
  };

  // Handle action menu (Edit/Delete)
  const handleActionMenuClick = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedDeploymentId(id);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedDeploymentId(null);
  };

  const handleEdit = () => {
    if (selectedDeploymentId) {
      const deployment = deployments.find((dep) => dep._id === selectedDeploymentId);
      if (deployment) {
        onEdit(deployment);
      }
    }
    handleActionMenuClose();
  };

  const handleDelete = () => {
    if (selectedDeploymentId) {
      onDelete(selectedDeploymentId);
    }
    handleActionMenuClose();
  };

  // Filter deployments based on selected filters
  const applyFilter = (deployments: Deployment[], selectedFilters: { [key: string]: string[] }) => {
    return deployments.filter((deployment) => {
      const matchesColumnFilters = Object.keys(selectedFilters).every((column) => {
        const selectedValues = selectedFilters[column];
        let value: any;

        if (column === "availability") {
          value = deployment.availableReplicas > 0 ? "Available" : "Not Available";
        } else if (column === "labels") {
          value = Object.entries(deployment.labels)
            .map(([key, value]) => `${key}=${value}`)
            .join(" ");
        } else if (column === "app") {
          value = deployment.application.name;
        } else {
          value = deployment[column as keyof Deployment];
        }

        if (Array.isArray(value)) {
          return selectedValues.some((selectedValue) =>
            value.some((item) => item.toLowerCase().includes(selectedValue.toLowerCase()))
          );
        }

        if (typeof value === "string") {
          return selectedValues.some((selectedValue) => value.toLowerCase().includes(selectedValue.toLowerCase()));
        } else if (typeof value === "number" || typeof value === "boolean") {
          return selectedValues.some((selectedValue) =>
            value.toString().toLowerCase().includes(selectedValue.toLowerCase())
          );
        }

        return false;
      });

      return matchesColumnFilters;
    });
  };

  const filteredDeployments = applyFilter(deployments, selectedFilters);

  const getColumnValues = (column: string) => {
    switch (column) {
      case "name":
        return Array.from(new Set(deployments.map((dep) => dep.name)));
      case "status":
        return Array.from(new Set(deployments.map((dep) => dep.status)));
      case "availability":
        return Array.from(
          new Set(deployments.map((dep) => (dep.availableReplicas > 0 ? "Available" : "Not Available")))
        );
      case "labels":
        return Array.from(
          new Set(deployments.flatMap((dep) => Object.entries(dep.labels).map(([key, value]) => `${key}=${value}`)))
        );
      case "app":
        return Array.from(new Set(deployments.map((dep) => dep.application.name)));
      default:
        return [];
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ marginBottom: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="outlined" startIcon={<FilterListIcon />} onClick={openFilterMenu}>
          Filters
        </Button>
      </Box>
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={closeFilterMenu}
        slotProps={{
          paper: {
            style: {
              width: "100%",
            },
          },
        }}>
        <Box sx={{ padding: 2 }}>
          {["app", "name", "status", "availability", "labels"].map((column) => (
            <Box key={column} sx={{ marginBottom: 2 }}>
              <FormControl fullWidth>
                <InputLabel>{column}</InputLabel>
                <Select
                  multiple
                  value={selectedFilters[column] || []}
                  onChange={(event) => applyColumnFilter(column, event.target.value as string[])}
                  input={<OutlinedInput label={column} />}
                  renderValue={(selected) => selected.join(", ")}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200,
                        width: 250,
                      },
                    },
                  }}
                  endAdornment={
                    <InputAdornment position="start">
                      {/* Apply Filter Button */}
                      {/* <IconButton
                        color="primary"
                        size="small"
                        onClick={() => applyColumnFilter(column, getColumnValues(column))}>
                        <FilterListIcon />
                      </IconButton> */}
                      {/* Reset Filter Button */}
                      <IconButton color="secondary" size="small" onClick={() => resetColumnFilter(column)}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  }>
                  {getColumnValues(column).map((value) => (
                    <MenuItem key={value} value={value}>
                      <Checkbox checked={selectedFilters[column]?.includes(value)} />
                      <ListItemText primary={value} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          ))}
        </Box>
      </Menu>

      <Stack divider={<Divider />} spacing={2}>
        {filteredDeployments.map((dep) => (
          <Stack key={dep._id}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6">{dep.name}</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", marginBottom: 1 }}>
                <Typography variant="body2">
                  <strong>Application Name:</strong> {dep.application.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {`${dep.availableReplicas} of ${dep.replicas} pods`}
                </Typography>
                <Typography variant="body2">
                  <strong>Availability:</strong> {dep.availableReplicas > 0 ? "Available" : "Not Available"}
                </Typography>
                <Typography variant="body2">
                  <strong>Labels:</strong>{" "}
                  {dep.labels
                    ? Object.entries(dep.labels)
                        .map(([key, value]) => `${key}=${value}`)
                        .join(", ")
                    : "None"}
                </Typography>
                <Typography variant="body2">
                  <strong>Age:</strong> {calculateAge(dep.createdAt)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton onClick={() => onRefresh(dep._id)}>
                {isRefreshing || IsDeplRefreshing === dep._id ? <CircularProgress size={24} /> : <CachedIcon />}
              </IconButton>
              <IconButton onClick={(event) => handleActionMenuClick(event, dep._id)}>
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Stack>
        ))}
        <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor)} onClose={handleActionMenuClose}>
          <MenuItem onClick={handleEdit}>Edit</MenuItem>
          <MenuItem onClick={handleDelete}>Delete</MenuItem>
        </Menu>
      </Stack>
    </Box>
  );
};

export default DeploymentList;
