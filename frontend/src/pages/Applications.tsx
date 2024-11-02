import React, { useEffect, useState } from "react";
import { Button, Typography, Box, Drawer } from "@mui/material";
import Grid from "@mui/material/Grid2";
import AddCircleTwoToneIcon from "@mui/icons-material/AddCircleTwoTone";
import ApplicationCard from "../components/applications/ApplicationCard";
import ApplicationForm from "../components/applications/ApplicationForm";
import ManagedDialogs from "../components/ManagedDialogs";
import Loader from "../components/Loader";
import { createApplication, fetchApplications, deleteApplication, updateApplication } from "../services/api";
import { Application } from "../types/Application";
import { useBreadcrumbs } from "../context/BreadcrumbsContext";

/**
 * Applications component to fetch and display a list of applications.
 * Allows creation, editing, and deletion of applications.
 * @returns {JSX.Element} The applications listing UI or loading state.
 */
const Applications: React.FC = (): JSX.Element => {
  const { setBreadcrumbs } = useBreadcrumbs();
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentApplication, setCurrentApplication] = useState<Application | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  /**
   * Sets the breadcrumbs when the component mounts.
   */
  useEffect(() => {
    const breadcrumbs = [{ label: "Applications", path: "/" }];
    setBreadcrumbs(breadcrumbs);
  }, [setBreadcrumbs]);

  /**
   * Fetches applications from the API when the component mounts.
   */
  useEffect(() => {
    let isMounted = true;

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
      const updatedApplication = await updateApplication(currentApplication.slug, data.name, data.description || "");
      setApplications(
        applications.map((app) =>
          app._id === currentApplication._id
            ? { ...app, name: data.name, description: data.description, slug: updatedApplication.slug }
            : app
        )
      );
    } else {
      // Create a new application
      const newApp = await createApplication(data);
      setApplications([...applications, newApp]);
    }
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
   * Handles the confirmation dialog for deleting an application.
   * @param {string} id - The ID of the application to delete.
   */
  const handleDelete = async (id: string) => {
    if (id) {
      await deleteApplication(id);
      setApplications(applications.filter((app) => app._id !== id));
    }
  };

  /**
   * Handles the request to close the form when clicking on drawer overlay.
   * If there are unsaved changes, a confirmation dialog is shown.
   * @param {function} showDialog - Function to show a dialog.
   */
  const handleClose = (showDialog: (dialogType: string, confirmCallback: () => void) => void) => {
    if (hasUnsavedChanges) {
      showDialog("confirmClose", () => {
        setHasUnsavedChanges(false);
        handleCloseForm(true);
      });
    } else {
      handleCloseForm();
    }
  };

  /**
   * Closes the form and resets state variables.
   * @param {boolean} forceClose - Whether to force close the form without checking for unsaved changes.
   */
  const handleCloseForm = (forceClose: boolean = false) => {
    console.log("Closing form...", hasUnsavedChanges, !forceClose);
    if (hasUnsavedChanges && !forceClose) return;
    setOpenForm(false);
    setCurrentApplication(null);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <ManagedDialogs itemType="application">
      {(showDialog) => (
        <Grid size={12} p={3}>
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
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={app._id}>
                <ApplicationCard
                  application={app}
                  onEdit={() => handleEdit(app)}
                  onDelete={() => showDialog("confirmDelete", () => handleDelete(app._id))}
                />
              </Grid>
            ))}
          </Grid>
          <Drawer anchor="right" open={openForm} onClose={() => handleClose(showDialog)}>
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
                      slug: currentApplication.slug,
                    }
                  : undefined
              }
              isEditMode={!!currentApplication}
              setHasUnsavedChanges={setHasUnsavedChanges}
              hasUnsavedChanges={hasUnsavedChanges}
              showDialog={showDialog}
            />
          </Drawer>
        </Grid>
      )}
    </ManagedDialogs>
  );
};

export default Applications;
