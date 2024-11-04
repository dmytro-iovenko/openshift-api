import { useEffect, useState } from "react";
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
  onSubmit: (data: { appId: string; name: string; image: string } | { appId: string; yaml: string }) => Promise<void>;
  initialData?: { name: string; image: string; yaml: string };
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
  const [formValues, setFormValues] = useState({
    name: initialData?.name || "",
    image: initialData?.image || "",
    isYamlMode: false,
    yaml: initialData?.yaml || "",
  });

  const [errors, setErrors] = useState<{ appId?: String; name?: string; image?: string; yaml?: string }>({});

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormValues({
          name: initialData.name,
          image: initialData.image,
          isYamlMode: formValues?.isYamlMode || false,
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
      if (field !== "isYamlMode") {
        // Check if any field is different from the initial values
        const modified =
          (updatedValues.isYamlMode && updatedValues.yaml !== (initialData?.yaml ?? "")) ||
          (!updatedValues.isYamlMode &&
            (updatedValues.name !== (initialData?.name ?? "") || updatedValues.image !== (initialData?.image ?? "")));
        console.log(modified, initialData, updatedValues);
        setHasUnsavedChanges(modified);
      } else {
        const modified =
          (updatedValues.isYamlMode && updatedValues.yaml !== (initialData?.yaml ?? "")) ||
          (!updatedValues.isYamlMode &&
            (updatedValues.name !== (initialData?.name ?? "") || updatedValues.image !== (initialData?.image ?? "")));
        console.log(modified, initialData, updatedValues);
        setHasUnsavedChanges(modified);
      }
      return updatedValues;
    });
  };

  /**
   * Handles form submission and validation.
   */
  const handleSubmit = async () => {
    const newErrors: { appId?: string; name?: string; image?: string; yaml?: string } = {};

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
        await onSubmit({ appId: selectedAppId, name: formValues.name, image: formValues.image });
      }
      setHasUnsavedChanges(false);
      onClose(true);
    } catch (error) {
      console.error("Error during deployment submission:", error);
      // TBD: show error notification
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

  return (
    <Box sx={{ p: 2, width: 400 }}>
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
      ) : (
        <>
          <TextField
            label="Deployment Name"
            value={formValues.name}
            onChange={(e) => handleChange("name", e.target.value)}
            fullWidth
            margin="normal"
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            label="Docker Image"
            value={formValues.image}
            onChange={(e) => handleChange("image", e.target.value)}
            fullWidth
            margin="normal"
            error={!!errors.image}
            helperText={errors.image}
          />
        </>
      )}
      <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
        <Button onClick={() => handleClose()}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!hasUnsavedChanges}>
          {initialData ? "Save" : "Create"}
        </Button>
      </Box>
    </Box>
  );
};

export default DeploymentForm;
