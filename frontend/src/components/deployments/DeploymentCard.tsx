import React, { useState } from "react";
import {
  Box,
  Chip,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Button,
  ButtonGroup,
  CircularProgress,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Deployment } from "../../types/Deployment";
import { useNavigate } from "react-router-dom";
import CachedIcon from "@mui/icons-material/Cached";

/**
 * Represents a card displaying deployment information and details.
 *
 * @property {Deployment} deployment - The deployment data to display.
 * @property {() => void} onEdit - Callback function for editing the deployment.
 * @property {() => void} onDelete - Callback function for deleting the deployment.
 * @property {() => void} onRefresh - Callback function for refreshing the deployment.
 * @property {boolean} isRefreshing - Flag indicating if the deployment is refreshing.
 */
interface DeploymentCardProps {
  deployment: Deployment;
  onDelete: () => void;
  onEdit: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

/**
 * DeploymentCard component to render a card displaying deployment information and details.
 *
 * @param {DeploymentCardProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
const DeploymentCard: React.FC<DeploymentCardProps> = ({ deployment, onDelete, onEdit, onRefresh, isRefreshing }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  /**
   * Handle opening the menu for Edit and Delete actions
   */
  const handleActionsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   *  Handle closing the menu for Edit and Delete actions
   */
  const handleActionsMenuClose = () => {
    setAnchorEl(null);
  };

  /**
   * Handle navigating to the application details page
   */
  const handleViewDetails = () => {
    navigate(`/deployments/${deployment.name}`);
  };

  // Extract labels from the deployment object and map them to an array of strings
  const labels = Object.entries(deployment.labels).map(([key, value]) => `${key}=${value}`);

  return (
    <Box
      border={1}
      borderColor="grey.300"
      borderRadius={2}
      padding={2}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      height="100%"
      marginBottom={2}>
      <Typography variant="h6">{deployment.name}</Typography>
      <Typography>Application Name: {deployment.application.name}</Typography>
      <Typography>Status: {`${deployment.availableReplicas} of ${deployment.replicas} pods`}</Typography>
      <Typography>Availability: {deployment.availableReplicas > 0 ? "Available" : "Not Available"}</Typography>
      <Box>
        {labels.map((label) => (
          <Chip key={label} label={label} style={{ marginRight: 4, marginBottom: 4 }} />
        ))}
      </Box>
      <Typography>Age: {calculateAge(deployment.createdAt)}</Typography>

      {/* Button group for actions */}
      <ButtonGroup sx={{ marginTop: 1 }}>
        <Button variant="outlined" size="small" onClick={handleViewDetails}>
          View details
        </Button>
        <IconButton onClick={isRefreshing ? undefined : onRefresh}>
          {isRefreshing ? <CircularProgress size={24} /> : <CachedIcon />}
        </IconButton>
        <IconButton onClick={handleActionsMenuOpen}>
          <MoreVertIcon />
        </IconButton>
      </ButtonGroup>

      {/* Menu for Edit and Delete actions */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleActionsMenuClose}>
        <MenuItem
          onClick={() => {
            onEdit();
            handleActionsMenuClose();
          }}>
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDelete();
            handleActionsMenuClose();
          }}
          sx={{ color: "red" }}>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

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

export default DeploymentCard;
