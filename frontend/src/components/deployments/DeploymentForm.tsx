import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid2";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import {
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  InputLabel,
  Stepper,
  StepLabel,
  Step,
  StepContent,
  IconButton,
} from "@mui/material";

/**
 * Represents the props for the DeploymentForm component.
 *
 * @property {boolean} open - Whether the dialog is open.
 * @property {() => void} onClose - Callback function to close the dialog.
 * @property {(data: { appId: string; name: string; image: string } | { appId: string; yaml: string }) => Promise<void>} onSubmit - Callback function to handle form submission.
 * @property {{ name: string; image: string }} [initialData] - Initial data for the form when editing.
 * @property {string[]} applications - Array of application IDs for selection.
 * @property {string} selectedAppId - Currently selected application ID.
 * @property {(id: string) => void} setSelectedAppId - Function to set the selected application ID.
 * @property {boolean} hasUnsavedChanges - Flag indicating if there are unsaved changes in the form.
 * @property {(hasUnsavedChanges: boolean) => void} setHasUnsavedChanges - Callback function to set the unsaved changes flag.
 */
interface DeploymentFormProps {
  open: boolean;
  onClose: (forceClose?: boolean) => void;
  onSubmit: (
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
  ) => Promise<void>;
  initialData?: {
    name: string;
    image: string;
    replicas: number;
    paused: boolean;
    envVars: { name: string; value: string }[];
    strategy: string;
    maxUnavailable: string;
    maxSurge: string;
    yaml: string;
  };
  applications: { _id: string; name: string }[]; // List of applications with IDs and names
  selectedAppId: string; // Currently selected application ID
  setSelectedAppId: (id: string) => void; // Function to update selected application ID
  isEditMode: boolean;
  setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
  hasUnsavedChanges: boolean;
  showDialog: (dialogType: string, confirmCallback: () => void) => void;
}

/**
 * DeploymentForm component for adding or editing deployments.
 *
 * @param {DeploymentFormProps} props - Component properties.
 * @returns {JSX.Element} The rendered deployment form.
 */
const DeploymentForm: React.FC<DeploymentFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  applications,
  selectedAppId,
  setSelectedAppId,
  isEditMode,
  hasUnsavedChanges,
  setHasUnsavedChanges,
  showDialog,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formValues, setFormValues] = useState({
    name: initialData?.name || "",
    image: initialData?.image || "",
    isYamlMode: false,
    yaml: initialData?.yaml || "",
    strategyType: "RollingUpdate",
    maxUnavailable: "25%",
    maxSurge: "25%",
    envVars: [{ name: "", value: "" }],
    paused: false,
    replicas: 3,
  });

  // const [errors, setErrors] = useState<{ appId?: String; name?: string; image?: string; yaml?: string }>({});
  const [errors, setErrors] = useState<{
    appId?: string;
    name?: string;
    image?: string;
    yaml?: string;
    maxUnavailable?: string;
    maxSurge?: string;
  }>({});

  useEffect(() => {
    if (open) {
      console.log("initialData", initialData);
      if (initialData) {
        setFormValues({
          ...formValues,
          name: initialData.name,
          image: initialData.image,
          replicas: initialData.replicas,
          paused: initialData.paused,
          envVars: initialData.envVars,
          strategyType: initialData.strategy,
          maxUnavailable: initialData.maxUnavailable,
          maxSurge: initialData.maxSurge,
          yaml: initialData.yaml,
        });
      }
      setErrors({});
      setHasUnsavedChanges(false);
    }
  }, [open]);

  /**
   * Handles change events for form fields and marks as modified when any field changes
   */
  const handleChange = (field: keyof typeof formValues, value: string | boolean) => {
    setFormValues((prev) => {
      const updatedValues = { ...prev, [field]: value };
      // console.log("handleChange:", field, value, initialData?.replicas, updatedValues.replicas, updatedValues.replicas != (initialData?.replicas ?? 3));
      if (field !== "isYamlMode") {
        // Reset maxUnavailable and maxSurge to defaults if the strategy is not "RollingUpdate"
        if (field === "strategyType") {
          if (value === "RollingUpdate") {
            updatedValues.maxUnavailable = initialData?.maxUnavailable ?? "25%";
            updatedValues.maxSurge = initialData?.maxSurge ?? "25%";
          } else {
            updatedValues.maxUnavailable = ""; // Clear these values for other strategies
            updatedValues.maxSurge = "";
          }
        }
        // Check if any field is different from the initial values
        const modified =
          (updatedValues.isYamlMode && updatedValues.yaml !== (initialData?.yaml ?? "")) ||
          (!updatedValues.isYamlMode &&
            (updatedValues.name !== (initialData?.name ?? "") ||
              updatedValues.image !== (initialData?.image ?? "") ||
              Number(updatedValues.replicas) != (Number(initialData?.replicas) ?? 3) ||
              updatedValues.paused !== (initialData?.paused ?? false) ||
              updatedValues.envVars !== (initialData?.envVars ?? [{ name: "", value: "" }]) ||
              updatedValues.strategyType !== (initialData?.strategy ?? "RollingUpdate") ||
              updatedValues.maxUnavailable !== (initialData?.maxUnavailable ?? "25%") ||
              updatedValues.maxSurge !== (initialData?.maxSurge ?? "25%")));
        setHasUnsavedChanges(modified);
      } else {
        const modified =
          (updatedValues.isYamlMode && updatedValues.yaml !== (initialData?.yaml ?? "")) ||
          (!updatedValues.isYamlMode &&
            (updatedValues.name !== (initialData?.name ?? "") ||
              updatedValues.image !== (initialData?.image ?? "") ||
              Number(updatedValues.replicas) != (Number(initialData?.replicas) ?? 3) ||
              updatedValues.paused !== (initialData?.paused ?? false) ||
              updatedValues.envVars !== (initialData?.envVars ?? [{ name: "", value: "" }]) ||
              updatedValues.strategyType !== (initialData?.strategy ?? "RollingUpdate") ||
              updatedValues.maxUnavailable !== (initialData?.maxUnavailable ?? "25%") ||
              updatedValues.maxSurge !== (initialData?.maxSurge ?? "25%")));
        setHasUnsavedChanges(modified);
      }
      return updatedValues;
    });
  };

  const handleEnvVarChange = (index: number, field: "name" | "value", value: string) => {
    const newEnvVars = [...formValues.envVars];
    newEnvVars[index][field] = value;
    setFormValues((prev) => ({ ...prev, envVars: newEnvVars }));
  };

  const addEnvVar = () => {
    setFormValues((prev) => ({ ...prev, envVars: [...prev.envVars, { name: "", value: "" }] }));
  };

  const incrementReplicas = () => {
    handleChange("replicas", `${Math.max(0, Number(formValues.replicas) + 1)}`);
  };

  const decrementReplicas = () => {
    handleChange("replicas", `${Math.max(0, Number(formValues.replicas) - 1)}`);
  };

  const handleReplicasChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Number(event.target.value));
    handleChange("replicas", `${value}`);
  };

  /**
   * Handles form submission and validation.
   */
  const handleSubmit = async () => {
    const newErrors: any = {};

    // Validate required fields
    if (!selectedAppId) {
      newErrors.appId = "Please select an application.";
    }
    if (!formValues.name && !formValues.isYamlMode) {
      newErrors.name = "Please enter the deployment name.";
    }
    if (!formValues.image && !formValues.isYamlMode) {
      newErrors.image = "Please provide a Docker image.";
    }
    if (!formValues.yaml && formValues.isYamlMode) {
      newErrors.yaml = "Please provide a YAML file.";
    }
    if (!formValues.replicas) {
      newErrors.replicas = "Please specify the number of replicas.";
    }
    if (!formValues.strategyType) {
      newErrors.replicas = "Please specify the strategy type.";
    }
    if (formValues.strategyType === "RollingUpdate") {
      if (!formValues.maxUnavailable) newErrors.maxUnavailable = "This field is required.";
      if (!formValues.maxSurge) newErrors.maxSurge = "This field is required.";
    }
    // If there are errors, set the errors state
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors and submit the form
    setErrors({});
    try {
      if (formValues.isYamlMode) {
        await onSubmit({ appId: selectedAppId, yaml: formValues.yaml });
      } else {
        const deploymentData = {
          appId: selectedAppId,
          name: formValues.name,
          image: formValues.image,
          replicas: formValues.replicas,
          paused: formValues.paused,
          envVars: formValues.envVars,
          strategy: formValues.strategyType,
          maxUnavailable: formValues.maxUnavailable,
          maxSurge: formValues.maxSurge,
        };
        await onSubmit(deploymentData);
      }
      setHasUnsavedChanges(false);
      onClose(true);
    } catch (error) {
      console.error("Error during deployment submission:", error);
    }
  };

  /**
   * Handles the request to close the form.
   * If there are unsaved changes, a confirmation dialog is shown.
   */
  const handleClose = () => {
    if (hasUnsavedChanges) {
      showDialog("confirmClose", () => {
        setHasUnsavedChanges(false);
        onClose(true);
      });
    } else {
      onClose();
    }
  };

  const handleNext = () => {
    const newErrors: any = {};

    // Validate fields based on the current active step
    if (activeStep === 0) {
      if (!formValues.name) newErrors.name = "Please enter the deployment name.";
      if (!formValues.image) newErrors.image = "Please provide a Docker image.";
    } else if (activeStep === 1) {
      if (formValues.strategyType === "RollingUpdate") {
        if (!formValues.maxUnavailable) newErrors.maxUnavailable = "This field is required.";
        if (!formValues.maxSurge) newErrors.maxSurge = "This field is required.";
      }
    }

    // If there are errors, set the errors state and prevent moving to the next step
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      // Clear errors and move to the next step
      setErrors({});
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const steps = [
    "Specify Deployment Name and Container Image",
    "Choose Deployment Strategy",
    "Add Environment Variables",
    "Configure Advanced Options",
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {isEditMode ? "Edit Deployment" : "Add Deployment"}
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel id="select-application">Select Application</InputLabel>
        <Select
          labelId="select-application"
          id="select-application"
          label="Select Application"
          value={selectedAppId}
          onChange={(e) => setSelectedAppId(e.target.value)}
          error={!!errors.appId}>
          {applications.map((app) => (
            <MenuItem key={app._id} value={app._id}>
              {app.name}
            </MenuItem>
          ))}
        </Select>
        {errors.appId && <Typography color="error">{errors.appId}</Typography>}
      </FormControl>
      <FormControlLabel
        label="Use YAML Input"
        control={
          <Switch checked={formValues.isYamlMode} onChange={(e) => handleChange("isYamlMode", e.target.checked)} />
        }
      />
      {formValues.isYamlMode ? (
        <>
          <TextField
            label="YAML Configuration"
            multiline
            rows={5}
            value={formValues.yaml}
            onChange={(e) => handleChange("yaml", e.target.value)}
            fullWidth
            margin="normal"
            error={!!errors.yaml}
            helperText={errors.yaml}
          />
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Button onClick={() => handleClose()}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!hasUnsavedChanges} variant="contained">
              {initialData ? "Save" : "Create"}
            </Button>
          </Box>
        </>
      ) : (
        <>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                {activeStep === 0 && (
                  <StepContent>
                    <TextField
                      label="Deployment Name"
                      value={formValues.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      fullWidth
                      margin="normal"
                      error={!!errors.name}
                      helperText={errors.name ?? "Name must match RFC 1123 subdomain format"}
                      required
                    />
                    <TextField
                      label="Image Name"
                      value={formValues.image}
                      onChange={(e) => handleChange("image", e.target.value)}
                      fullWidth
                      margin="normal"
                      error={!!errors.image}
                      helperText={errors.image ?? "Container image name"}
                      required
                    />
                    <Button variant="contained" onClick={handleNext} sx={{ mt: 2 }}>
                      Next
                    </Button>
                  </StepContent>
                )}
                {activeStep === 1 && (
                  <StepContent>
                    {/* Deployment Strategy Section */}
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="strategy-type">Strategy Type</InputLabel>
                      <Select
                        labelId="strategy-type"
                        id="strategy-type"
                        label="Strategy Type"
                        value={formValues.strategyType}
                        onChange={(e) => handleChange("strategyType", e.target.value)}>
                        <MenuItem value="RollingUpdate">Rolling Update</MenuItem>
                        <MenuItem value="Recreate">Recreate</MenuItem>
                      </Select>
                      {formValues.strategyType === "RollingUpdate" ? (
                        <Typography variant="caption" color="text.secondary" sx={{ mx: 2 }}>
                          The rolling update strategy waits for pods to pass readiness checks before scaling down old
                          components and scaling up new ones.
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ mx: 2 }}>
                          The recreate strategy follows basic rollout behavior.
                        </Typography>
                      )}
                    </FormControl>

                    {/* Conditionally render maxUnavailable and maxSurge fields */}
                    {formValues.strategyType === "RollingUpdate" && (
                      <>
                        <TextField
                          label="Maximum number of unavailable Pods"
                          value={formValues.maxUnavailable}
                          onChange={(e) => handleChange("maxUnavailable", e.target.value)}
                          fullWidth
                          margin="normal"
                          required
                          error={!!errors.maxUnavailable}
                          helperText={
                            errors.maxUnavailable ||
                            "The maximum number of pods that can be unavailable during the rolling deployment."
                          }
                        />
                        <TextField
                          label="Maximum number of surge Pods"
                          value={formValues.maxSurge}
                          onChange={(e) => handleChange("maxSurge", e.target.value)}
                          fullWidth
                          margin="normal"
                          required
                          error={!!errors.maxSurge}
                          helperText={
                            errors.maxSurge ||
                            "The maximum number of pods that can be scheduled above the original number of pods."
                          }
                        />
                      </>
                    )}
                    <Button variant="contained" onClick={handleBack} sx={{ mt: 2 }}>
                      Back
                    </Button>
                    <Button variant="contained" onClick={handleNext} sx={{ mt: 2, ml: 2 }}>
                      Next
                    </Button>
                  </StepContent>
                )}
                {activeStep === 2 && (
                  <StepContent>
                    {/* Environment Variables Section */}
                    {formValues.envVars.map((envVar, index, senVars) => (
                      <Grid container spacing={2} key={index} alignItems="center" sx={{ mt: 1 }}>
                        <Grid size={{ xs: 5 }}>
                          <TextField
                            placeholder="Name"
                            value={envVar.name}
                            onChange={(e) => handleEnvVarChange(index, "name", e.target.value)}
                            fullWidth
                          />
                        </Grid>
                        <Grid size={{ xs: 5 }}>
                          <TextField
                            placeholder="Value"
                            value={envVar.value}
                            onChange={(e) => handleEnvVarChange(index, "value", e.target.value)}
                            fullWidth
                          />
                        </Grid>
                        <Grid size={{ xs: 2 }}>
                          <IconButton
                            onClick={() => {
                              if (senVars.length > 1) {
                                // Delete subsequent inputs
                                const newEnvVars = [...formValues.envVars];
                                newEnvVars.splice(index, 1);
                                setFormValues((prev) => ({ ...prev, envVars: newEnvVars }));
                              } else {
                                // Reset the first input
                                setFormValues((prev) => ({
                                  ...prev,
                                  envVars: [{ name: "", value: "" }],
                                }));
                              }
                            }}
                            disabled={senVars.length === 1 && !envVar.name && !envVar.value}>
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    ))}
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 10 }}>
                        <Typography variant="caption" color="text.secondary">
                          Add Environment Variable
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 2 }}>
                        <IconButton color="primary" onClick={addEnvVar}>
                          <AddCircleIcon />
                        </IconButton>
                      </Grid>
                    </Grid>

                    <Button variant="contained" onClick={handleBack} sx={{ mt: 2 }}>
                      Back
                    </Button>
                    <Button variant="contained" onClick={handleNext} sx={{ mt: 2, ml: 2 }}>
                      Next
                    </Button>
                  </StepContent>
                )}
                {activeStep === 3 && (
                  <StepContent>
                    <Box>
                      <Typography variant="subtitle1">Scaling</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Replicas are scaled manually based on CPU usage.
                      </Typography>
                      <Grid container spacing={2} alignItems="center">
                        <Grid>
                          <Button variant="outlined" onClick={decrementReplicas}>
                            -
                          </Button>
                        </Grid>
                        <Grid>
                          <TextField
                            id="replicas-input"
                            type="number"
                            size="small"
                            value={formValues.replicas}
                            onChange={handleReplicasChange}
                            slotProps={{
                              htmlInput: {
                                min: 0,
                                style: {
                                  textAlign: "center",
                                },
                              },
                            }}
                            sx={{
                              width: 60,
                              textAlign: "center",
                              "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                                display: "none",
                              },
                              "& input[type=number]": {
                                MozAppearance: "textfield",
                                margin: 0,
                              },
                            }}
                            required
                          />
                        </Grid>
                        <Grid>
                          <Button variant="outlined" onClick={incrementReplicas}>
                            +
                          </Button>
                        </Grid>
                      </Grid>
                      <Typography variant="body2" color="textSecondary">
                        The number of instances of your Image.
                      </Typography>
                    </Box>

                    <Button variant="contained" onClick={handleBack} sx={{ mt: 2 }}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={!hasUnsavedChanges}
                      sx={{ mt: 2, ml: 2 }}>
                      {isEditMode ? "Save" : "Create"}
                    </Button>
                  </StepContent>
                )}
              </Step>
            ))}
          </Stepper>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Button onClick={() => handleClose()}>Cancel</Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default DeploymentForm;
