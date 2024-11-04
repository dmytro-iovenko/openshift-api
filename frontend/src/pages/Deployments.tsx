import React, { useEffect, useState } from "react";
import { Button, Typography, Box, Drawer } from "@mui/material";
import Grid from "@mui/material/Grid2";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddCircleTwoToneIcon from "@mui/icons-material/AddCircleTwoTone";
import DeploymentCard from "../components/deployments/DeploymentCard";
import DeploymentForm from "../components/deployments/DeploymentForm";
import ManagedDialogs from "../components/ManagedDialogs";
import Loader from "../components/Loader";
import { Deployment } from "../types/Deployment";
import { Application } from "../types/Application";
import { useBreadcrumbs } from "../context/BreadcrumbsContext";
import { useNotification } from "../context/NotificationContext";
import {
  fetchDeployment,
  fetchDeployments,
  createDeployment,
  deleteDeployment,
  updateDeployment,
  createDeploymentFromYaml,
} from "../services/api";
import LoadingButton from "@mui/lab/LoadingButton";

/**
 * Deployments component to fetch and display a list of deployments.
 * Allows creation, editing, and deletion of deployments.
 * @returns {JSX.Element} The deployments listing UI or loading state.
 */
const Deployments: React.FC = (): JSX.Element => {
  const { setBreadcrumbs } = useBreadcrumbs();
  const { addNotification } = useNotification();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [currentDeployment, setCurrentDeployment] = useState<Deployment | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedAppId, setSelectedAppId] = useState("");

  const [isRefreshing, setIsAllRefreshing] = useState<boolean>(false);
  const [isAppRefreshing, setIsAppRefreshing] = useState<string | null>(null);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  /**
   * Sets the breadcrumbs when the component mounts.
   */
  useEffect(() => {
    setBreadcrumbs([{ label: "Deployments", path: "/" }]);
  }, [setBreadcrumbs]);

  /**
   * Fetches deployments from the API when the component mounts.
   */
  useEffect(() => {
    let isMounted = true;

    const getDeployments = async () => {
      try {
        const deps = await fetchDeployments();
        if (isMounted) {
          const uniqueAppIds = new Set<string>();
          const appsMap: Record<string, Application> = {};

          deps.forEach((dep) => {
            if (!uniqueAppIds.has(dep.application._id)) {
              uniqueAppIds.add(dep.application._id);
              appsMap[dep.application._id] = dep.application;
            }
          });
          setApplications(Object.values(appsMap));
          setDeployments(deps);
        }
      } catch (error) {
        console.error("Failed to fetch deployments:", error);
        addNotification("Failed to fetch deployments.", "error");
      } finally {
        setLoading(false);
        setOpenForm(false);
        setCurrentDeployment(null);
        setSelectedAppId("");
      }
    };
    getDeployments();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Handles form submission for both adding and editing deployments.
   * @param {Object} data - The deployment data submitted from the form.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  const handleFormSubmit = async (
    data:
      | {
          appId: string;
          name: string;
          image: string;
          replicas: number;
          paused: boolean;
          envVars: { name: string; value: string }[];
          strategy: string;
          maxUnavailable: string;
          maxSurge: string;
        }
      | { appId: string; yaml: string }
  ) => {
    try {
      if (currentDeployment) {
        // Update existing deployment
        const updatedDeployment =
          "yaml" in data
            ? await createDeploymentFromYaml({
                applicationId: currentDeployment.application._id,
                yamlDefinition: data.yaml,
              })
            : await updateDeployment(currentDeployment._id, data);
        setDeployments(deployments.map((depl) => (depl._id === currentDeployment._id ? updatedDeployment : depl)));
        addNotification("Deployment updated successfully!", "success");
      } else {
        // Create a new deployment
        const newDeployment =
          "yaml" in data
            ? await createDeploymentFromYaml({ applicationId: data.appId, yamlDefinition: data.yaml })
            : await createDeployment({ applicationId: data.appId, ...data });
        console.log("New deployment:", newDeployment);
        setDeployments([...deployments, newDeployment]);
        addNotification("Deployment created successfully!", "success");
      }
    } catch (error) {
      console.error("Error during deployment submission:", error);
      addNotification("Error saving deployment. Please try again.", "error");
    }
  };

  /**
   * Opens the form for editing an existing deployment.
   * @param {Deployment} deployment - The deployment to edit.
   */
  const handleEdit = (deployment: Deployment) => {
    setSelectedAppId(deployment.application._id);
    setCurrentDeployment(deployment);
    setOpenForm(true);
  };

  /**
   * Handles the confirmation dialog for deleting an deployment.
   * @param {string} id - The ID of the deployment to delete.
   */
  const handleDelete = async (id: string) => {
    try {
      if (id) {
        await deleteDeployment(id);
        setDeployments(deployments.filter((depl) => depl._id !== id));
        addNotification("Deployment deleted successfully!", "success");
      } else {
        addNotification("No deployment ID provided for deletion.", "error");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      addNotification("Failed to delete deployment. Please try again.", "error");
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
    if (hasUnsavedChanges && !forceClose) return;
    setOpenForm(false);
    setCurrentDeployment(null);
    setSelectedAppId("");
  };

  /**
   * Refreshes all applications by fetching the latest data from the API.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  const handleRefreshAll = async () => {
    setIsAllRefreshing(true);
    try {
      const deployments = await fetchDeployments();
      setDeployments(deployments);
      addNotification("Deployments refreshed successfully!", "success");
    } catch (error) {
      console.error("Failed to refresh deployments:", error);
      addNotification("Failed to refresh deployments.", "error");
    } finally {
      setIsAllRefreshing(false);
    }
  };

  /**
   * Refreshes a deployment by fetching the latest data from the API.
   * @param {string} deploymentId - The ID of the deployment to refresh.
   */
  const refreshDeployment = async (deploymentId: string) => {
    setIsAppRefreshing(deploymentId);
    try {
      const updatedDepl = await fetchDeployment(deploymentId);
      console.log("Updated deployment:", updatedDepl);
      setDeployments((prev) => prev.map((depl) => (depl._id === updatedDepl._id ? updatedDepl : depl)));
      addNotification(`Deployment "${updatedDepl.name}" refreshed successfully.`, "success");
    } catch (error) {
      console.error("Error fetching deployment:", error);
      addNotification("Failed to refresh deployment. Please try again.", "error");
    } finally {
      setIsAppRefreshing(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <ManagedDialogs itemType="deployment">
      {(showDialog) => (
        <Grid size={12} p={3}>
          <Box display="flex" justifyContent="space-between" pb={2} flexWrap="wrap">
            <Typography variant="h4" gutterBottom>
              Deployments
            </Typography>
            <Box display="flex" flexWrap="wrap" alignItems="start" gap={1}>
              <LoadingButton
                variant="outlined"
                color="primary"
                onClick={handleRefreshAll}
                loading={isRefreshing}
                loadingPosition="start"
                startIcon={<RefreshIcon />}>
                Refresh All
              </LoadingButton>

              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenForm(true)}
                startIcon={<AddCircleTwoToneIcon />}>
                Create new deployment
              </Button>
            </Box>
          </Box>

          <Grid container direction="row" spacing={{ xs: 2, sm: 3 }} columns={12}>
            {deployments.map((deployment) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={deployment._id}>
                <DeploymentCard
                  deployment={deployment}
                  onEdit={() => handleEdit(deployment)}
                  onDelete={() => showDialog("confirmDelete", () => handleDelete(deployment._id))}
                  onRefresh={() => refreshDeployment(deployment._id)}
                  isRefreshing={isRefreshing || isAppRefreshing === deployment._id}
                />
              </Grid>
            ))}
          </Grid>
          <Drawer anchor="right" open={openForm} onClose={() => handleClose(showDialog)}>
            <DeploymentForm
              open={openForm}
              onClose={handleCloseForm}
              onSubmit={handleFormSubmit}
              initialData={
                currentDeployment
                  ? {
                      name: currentDeployment.name,
                      image: currentDeployment.image,
                      replicas: currentDeployment.replicas,
                      paused: currentDeployment.paused || false,
                      envVars: currentDeployment.envVars.map((envVar) => ({ name: envVar.name, value: envVar.value })),
                      strategy: currentDeployment.strategy,
                      maxUnavailable: currentDeployment.maxUnavailable,
                      maxSurge: currentDeployment.maxSurge,
                      yaml: "",
                    }
                  : undefined
              }
              applications={applications}
              selectedAppId={selectedAppId}
              setSelectedAppId={setSelectedAppId}
              isEditMode={!!currentDeployment}
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

export default Deployments;
