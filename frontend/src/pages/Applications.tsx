import React, { useEffect, useState } from "react";
// import { Container, Grid, Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs } from "@mui/material";
import { Button, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid2";
import AddCircleTwoToneIcon from "@mui/icons-material/AddCircleTwoTone";
import Loader from "../components/Loader";
import ApplicationCard from "../components/applications/ApplicationCard";
import ApplicationForm from "../components/applications/ApplicationForm";
import { createApplication, fetchApplications, deleteApplication, updateApplication } from "../services/api";
import { Application } from "../types/Application";

/**
 * Applications component to fetch and display a list of applications.
 * @returns {JSX.Element} The applications listing UI or loading state.
 */
const Applications: React.FC = (): JSX.Element => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentApplication, setCurrentApplication] = useState<Application | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  //   const [openDetails, setOpenDetails] = useState(false);
  //   const [tabIndex, setTabIndex] = useState(0);
  //   const [deployments, setDeployments] = useState<Deployment[]>([]);

  /**
   * Fetches applications from the API when the component mounts.
   */
  useEffect(() => {
    let isMounted = true; // Track if the component is mounted

    const getApplications = async () => {
      try {
        console.log("Fetching applications...");
        const apps = await fetchApplications();
        if (isMounted) {
          setApplications(apps);
        }
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      } finally {
        setLoading(false);
        setOpenForm(false);
        setCurrentApplication(null);
      }
    };
    getApplications();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Handles form submission for both adding and editing applications.
   * @param {Object} data - The application data submitted from the form.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  const handleFormSubmit = async (data: { name: string; description?: string; image?: string }): Promise<void> => {
    if (currentApplication) {
      // Update existing application
      await updateApplication(currentApplication._id, data.name, data.description || "");
      setApplications(
        applications.map((app) =>
          app._id === currentApplication._id ? { ...app, name: data.name, description: data.description } : app
        )
      );
    } else {
      const newApp = await createApplication(data);
      setApplications([...applications, newApp]);
    }
  };

  /**
   * Handles the deletion of an application.
   * @param {string} id - The ID of the application to delete.
   * @returns {Promise<void>} A promise that resolves when the application is deleted.
   */
  const handleDelete = async (id: string): Promise<void> => {
    await deleteApplication(id);
    setApplications(applications.filter((app) => app._id !== id));
  };

  /**
   * Opens the form for editing an existing application.
   * @param {Application} application - The application to edit.
   */
  const handleEdit = (application: Application) => {
    setCurrentApplication(application);
    setOpenForm(true);
  };

  /**
   * Closes the form and resets state variables
   */
  const handleCloseForm = () => {
    setCurrentApplication(null);
    setOpenForm(false);
  };

  //   const handleDetailsOpen = async (application: Application) => {
  //     setCurrentApplication(application);
  //     setOpenDetails(true);
  //     try {
  //       const deps = await fetchDeployments(application._id);
  //       setDeployments(deps);
  //     } catch (error) {
  //       console.error("Failed to fetch deployments:", error);
  //       setDeployments([]);
  //     }
  //   };

  //   const handleDetailsClose = () => {
  //     setOpenDetails(false);
  //     setCurrentApplication(null);
  //   };

  //   const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
  //     setTabIndex(newValue);
  //   };

  if (loading) {
    return <Loader />; // Show loader while fetching data
  }

  return (
    <Grid direction="row" size={12} p={3}>
      <Box display="flex" justifyContent="space-between" pb={4}>
        <Typography variant="h4">Applications</Typography>
        <Box display="flex" flexDirection="column">
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenForm(true)}
            startIcon={<AddCircleTwoToneIcon />}>
            Create new application
          </Button>
        </Box>
      </Box>
      <Grid container direction="row" spacing={{ xs: 2, sm: 3 }} columns={12}>
        {applications.map((app) => (
          <Grid direction="row" size={{ xs: 12, sm: 6, lg: 4 }} key={app._id}>
            <ApplicationCard application={app} onEdit={() => handleEdit(app)} onDelete={() => handleDelete(app._id)} />
          </Grid>
        ))}
      </Grid>
      <ApplicationForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={
          currentApplication
            ? {
                name: currentApplication.name,
                description: currentApplication.description,
                image: currentApplication.image,
              }
            : undefined
        }
        isEditMode={!!currentApplication} // Set to true if editing, false if creating
      />
    </Grid>
  );
};

export default Applications;
