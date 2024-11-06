import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Menu,
  MenuItem,
  ButtonGroup,
  CircularProgress,
} from "@mui/material";
import CachedIcon from "@mui/icons-material/Cached";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Application } from "../../types/Application";
import ApplicationStatusChart from "./ApplicationStatusChart";
import { LiaCubeSolid, LiaCubesSolid } from "react-icons/lia";
import { TbRouteSquare2 } from "react-icons/tb";
import { getColorFromName } from "../../helpers/colors";

/**
 * Represents a card displaying application information and details.
 *
 * @property {Application} application - The application data to display.
 * @property {() => void} onEdit - Callback function for editing the application.
 * @property {() => void} onDelete - Callback function for deleting the application.
 * @property {() => void} onRefresh - Callback function for refreshing the application.
 * @property {boolean} isRefreshing - Flag indicating if the application is refreshing.
 */
interface ApplicationCardProps {
  application: Application;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

/**
 * ApplicationCard component to render a card displaying application information and details.
 *
 * @param {ApplicationCardProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onEdit,
  onDelete,
  onRefresh,
  isRefreshing,
}): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const navigate = useNavigate();

  /**
   * Handle navigating to the application details page
   */
  const handleViewDetails = () => {
    navigate(`/applications/${application.slug}`);
  };

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

  const indicatorColor = getColorFromName(application.name);

  return (
    <>
      <Card
        sx={{
          height: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          "& .MuiCard-indicator": {
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: "5px",
            background: indicatorColor,
          },
        }}>
        <Box className="MuiCard-indicator" />
        <CardContent sx={{ pt: 3, pb: 0, flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Box display="flex" justifyContent="space-between" sx={{ flexGrow: 1 }}>
            <Box display="flex" sx={{ width: 1, flexGrow: 1, flexDirection: "column" }}>
              <Typography variant="h5">{application.name}</Typography>
              <Typography variant="subtitle2" sx={{ color: "rgb(114, 117, 120)", flexGrow: 1 }}>
                {application.description}
              </Typography>
            </Box>
            <ApplicationStatusChart deployments={application.deployments} />
          </Box>
          <List>
            <ListItem sx={{ px: 0 }}>
              <ListItemAvatar sx={{ minWidth: 0, mr: 1 }}>
                <LiaCubesSolid size={25} />
              </ListItemAvatar>
              <ListItemText primary="Deployments" />
              <Typography variant="subtitle2">{application.deployments?.length || "-"}</Typography>
            </ListItem>
            <Divider />
            <ListItem sx={{ px: 0 }}>
              <ListItemAvatar sx={{ minWidth: 0, mr: 1 }}>
                <LiaCubeSolid size={25} />
              </ListItemAvatar>
              <ListItemText primary="Pods" />
              <Typography variant="subtitle2">-</Typography>
            </ListItem>
            <Divider />
            <ListItem sx={{ px: 0 }}>
              <ListItemAvatar sx={{ minWidth: 0, mr: 1 }}>
                <TbRouteSquare2 size={25} />
              </ListItemAvatar>
              <ListItemText primary="Routes" />
              <Typography variant="subtitle2">-</Typography>
            </ListItem>
          </List>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: "space-between", p: 2 }}>
          <Button variant="outlined" size="small" onClick={handleViewDetails}>
            View details
          </Button>
          <ButtonGroup>
            <IconButton onClick={isRefreshing ? undefined : onRefresh}>
              {isRefreshing ? <CircularProgress size={24} /> : <CachedIcon />}
            </IconButton>
            <IconButton onClick={handleActionsMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </ButtonGroup>
        </CardActions>
      </Card>

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
    </>
  );
};

export default ApplicationCard;
