import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddCircleTwoToneIcon from "@mui/icons-material/AddCircleTwoTone";
import DeploymentForm from "../components/deployments/DeploymentForm";
import ManagedDialogs from "../components/ManagedDialogs";
import Loader from "../components/Loader";
import { Deployment } from "../types/Deployment";
import { Application } from "../types/Application";
import { useNotification } from "../context/NotificationContext";
import {
  fetchDeployment,
  fetchDeployments,
  createDeployment,
  deleteDeployment,
  updateDeployment,
  createDeploymentFromYaml,
  fetchApplications,
} from "../services/api";
import LoadingButton from "@mui/lab/LoadingButton";
// import DeploymentTable from "../components/deployments/DeploymentTable";
import DrawerWithForm from "../components/DrawerWithForm";
import { PageContainer, PageContainerToolbar } from "@toolpad/core";
import { useScreenSize } from "../context/ScreenSizeContext";
import DeploymentList from "../components/deployments/DeploymentList";
import { IconButton, Tooltip } from "@mui/material";
import TableWrapper from "../components/TableWrapper";

const Deployments: React.FC = (): JSX.Element => {
  const { addNotification } = useNotification();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [currentDeployment, setCurrentDeployment] = useState<Deployment | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedAppId, setSelectedAppId] = useState("");
  const [originalAppId, setOriginalAppId] = useState("");

  const [isRefreshing, setIsAllRefreshing] = useState<boolean>(false);
  const [isDeplRefreshing, setIsDeplRefreshing] = useState<string | null>(null);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<{
    generalSettings: boolean;
    envVars: boolean;
  }>({
    generalSettings: false,
    envVars: false,
  });

  const { isMobile } = useScreenSize();

  /**
   * Fetches deployments from the API when the component mounts.
   */
  useEffect(() => {
    let isMounted = true;

    const getDeployments = async () => {
      try {
        const deps = await fetchDeployments();
        const apps = await fetchApplications();
        if (isMounted) {
          const uniqueAppIds = new Set<string>();
          const appsMap: Record<string, Application> = {};

          apps.forEach((app) => {
            if (!uniqueAppIds.has(app._id)) {
              uniqueAppIds.add(app._id);
              appsMap[app._id] = app;
            }
          });
          setApplications(Object.values(appsMap));
          setDeployments(deps);
        }
      } catch (error) {
        console.error("Failed to fetch deployments:", error);
        addNotification("Failed to fetch deployments.", "error");
      } finally {
        if (isMounted) {
          setLoading(false);
          setOpenForm(false);
          setCurrentDeployment(null);
          setSelectedAppId("");
          setOriginalAppId("");
        }
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
        setDeployments([...deployments, newDeployment]);
        addNotification("Deployment created successfully!", "success");
      }
    } catch (error) {
      addNotification("Error saving deployment. Please try again.", "error");
      throw error;
    }
  };

  /**
   * Opens the form for editing an existing deployment.
   * @param {Deployment} deployment - The deployment to edit.
   */
  const handleEdit = (deployment: Deployment) => {
    setSelectedAppId(deployment.application._id);
    setOriginalAppId(deployment.application._id);
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
    if (hasUnsavedChanges.generalSettings || hasUnsavedChanges.envVars) {
      showDialog("confirmClose", () => {
        setHasUnsavedChanges({
          generalSettings: false,
          envVars: false,
        });
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
    if ((hasUnsavedChanges.generalSettings || hasUnsavedChanges.envVars) && !forceClose) return;
    setOpenForm(false);
    setCurrentDeployment(null);
    setSelectedAppId("");
    setOriginalAppId("");
  };

  /**
   * Refreshes all deployments by fetching the latest data from the API.
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
    setIsDeplRefreshing(deploymentId);
    try {
      const updatedDepl = await fetchDeployment(deploymentId);
      setDeployments((prev) => prev.map((depl) => (depl._id === updatedDepl._id ? updatedDepl : depl)));
      addNotification(`Deployment "${updatedDepl.name}" refreshed successfully.`, "success");
    } catch (error) {
      console.error("Error fetching deployment:", error);
      addNotification("Failed to refresh deployment. Please try again.", "error");
    } finally {
      setIsDeplRefreshing(null);
    }
  };

  if (loading) return <Loader />;

  const PageToolbar = () => {
    return (
      <PageContainerToolbar>
        {!isMobile ? (
          <LoadingButton
            variant="outlined"
            color="primary"
            onClick={handleRefreshAll}
            loading={isRefreshing}
            loadingPosition="start"
            startIcon={<RefreshIcon />}>
            Refresh All
          </LoadingButton>
        ) : (
          <Tooltip title="Refresh All Deployments">
            <IconButton color="primary" onClick={handleRefreshAll}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
        {!isMobile ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenForm(true)}
            startIcon={<AddCircleTwoToneIcon />}>
            Add Deployment
          </Button>
        ) : (
          <Tooltip title="Add Deployment">
            <IconButton color="primary" onClick={() => setOpenForm(true)}>
              <AddCircleTwoToneIcon />
            </IconButton>
          </Tooltip>
        )}
      </PageContainerToolbar>
    );
  };

  // Define columns and data for the deployments table
  const columns = [
    { id: "app", label: "Application Name" },
    { id: "name", label: "Deployment Name" },
    { id: "status", label: "Status" },
    { id: "availability", label: "Availability" },
    { id: "labels", label: "Labels" },
    { id: "age", label: "Age" },
  ];

  // Map deployment data to table rows
  const data: any = deployments.map((d) => ({
    id: d._id,
    app: d.application.name,
    name: d.name,
    status: `${d.availableReplicas} of ${d.replicas} pods`,
    availability: d.availableReplicas > 0 ? "Available" : "Not Available",
    labels: d.labels ? Object.entries(d.labels).map(([key, value]) => `${key}=${value}`) : [],
    createdAt: d.createdAt,
  }));

  const handleRowAction = async (action: string, id: string) => {
    if (action === "edit") {
      const deployment = deployments.find((d) => d._id === id);
      if (deployment) {
        setSelectedAppId(deployment.application._id);
        setOriginalAppId(deployment.application._id);
        setCurrentDeployment(deployment);
        setOpenForm(true);
      } else {
        addNotification("No deployment found for edition.", "error");
      }
    } else if (action === "delete") {
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
    } else if (action === "refresh") {
      try {
        const updatedDepl = await fetchDeployment(id);
        setDeployments((prev) => prev.map((depl) => (depl._id === updatedDepl._id ? updatedDepl : depl)));
        addNotification(`Deployment "${updatedDepl.name}" refreshed successfully.`, "success");
      } catch (error) {
        console.error("Error fetching deployment:", error);
        addNotification("Failed to refresh deployment. Please try again.", "error");
      }
    }
  };

  return (
    <PageContainer slots={{ toolbar: PageToolbar }} maxWidth={false}>
      <ManagedDialogs itemType="deployment">
        {(showDialog) => (
          <>
            {isMobile ? (
              <DeploymentList
                deployments={deployments}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRefresh={refreshDeployment}
                IsDeplRefreshing={isDeplRefreshing}
                isRefreshing={isRefreshing}
              />
            ) : (
              <TableWrapper
                columns={columns}
                data={data}
                onRowAction={handleRowAction}
                rowActions={{ edit: "edit", delete: "delete", refresh: "refresh" }}
                isRefreshing={isRefreshing}
                initialOrder="asc"
                initialOrderBy="name"
                rowsPerPage={10}
              />
              // <DeploymentTable
              //   deployments={deployments}
              //   loading={loading}
              //   onEdit={handleEdit}
              //   onDelete={handleDelete}
              //   onRefresh={refreshDeployment}
              //   IsDeplRefreshing={isDeplRefreshing}
              //   isRefreshing={isRefreshing}
              // />
            )}

            <DrawerWithForm
              open={openForm}
              onClose={() => handleClose(showDialog)}
              formComponent={
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
                          envVars: currentDeployment.envVars.map((envVar) => ({
                            name: envVar.name,
                            value: envVar.value,
                          })),
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
                  originalAppId={originalAppId}
                  setOriginalAppId={setOriginalAppId}
                  isEditMode={!!currentDeployment}
                  isAppSelectorLocked={false}
                  setHasUnsavedChanges={setHasUnsavedChanges}
                  hasUnsavedChanges={hasUnsavedChanges}
                  showDialog={showDialog}
                />
              }
            />
          </>
        )}
      </ManagedDialogs>
    </PageContainer>
  );
};

export default Deployments;
