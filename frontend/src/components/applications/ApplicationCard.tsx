import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import CachedIcon from "@mui/icons-material/Cached";
import { Application } from "../../types/Application";
import { fetchDeployments } from "../../services/api";
import ApplicationDetails from "./ApplicationDetails";
import DeploymentTable from "../deployments/DeploymentTable";
import ApplicationStatusChart from "./ApplicationStatusChart";
import { LiaCubeSolid, LiaCubesSolid } from "react-icons/lia";
import { TbRouteSquare2 } from "react-icons/tb";
import stringHash from "string-hash";
import tinycolor from "tinycolor2";

const getColorFromName = (name: string): string => {
  if (!name) return "#f5f5f6";
  const hash = stringHash(name);
  const hue = hash % 360;
  return tinycolor({ h: hue, s: 70, l: 50 }).toHexString();
};

interface ApplicationCardProps {
  application: Application;
  onEdit: () => void;
  onDelete: () => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onEdit, onDelete }) => {
  const [openModal, setOpenModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (openModal) {
      fetchApplicationDeployments();
    }
  }, [openModal]);

  const handleOpenModal = () => {
    setOpenModal(true);
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
          <Button variant="outlined" color="secondary" size="small" onClick={handleOpenModal}>
            View details
          </Button>
          <Button size="small" color="primary" onClick={onEdit}>
            Edit
          </Button>
          <Button size="small" color="secondary" onClick={onDelete}>
            Delete
          </Button>
          <IconButton aria-label="Refresh">
            <CachedIcon />
          </IconButton>
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
            {activeTab === 0 && <ApplicationDetails application={application} />}
            {activeTab === 1 && <DeploymentTable deployments={deployments} loading={loading} />}
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
