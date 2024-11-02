import { useEffect, useState } from "react";
import { TextField, Button, Box, Typography, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ConfirmationDialog from "../ConfirmationDialog";

/**
 * Represents the application form.
 *
 * @property {boolean} open - Whether the dialog is open.
 * @property {() => void} onClose - Callback function to close the dialog.
 * @property {(data: { name: string; description?: string; image?: string }) => Promise<void>} onSubmit - Callback function to handle form submission.
 * @property {{ name: string; description?: string; image?: string }} [initialData] - Initial data for the form when editing.
 * @property {boolean} isEditMode - Flag indicating if the form is in edit mode.
 * @property {(hasUnsavedChanges: boolean) => void} setHasUnsavedChanges - Callback function to set the unsaved changes flag.
 */
interface ApplicationFormProps {
  open: boolean;
  onClose: (forceClose?: boolean) => void;
  onSubmit: (data: { name: string; description?: string; image?: string }) => Promise<void>;
  initialData?: { name: string; description?: string; image?: string; slug: string };
  isEditMode: boolean;
  setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
  hasUnsavedChanges: boolean;
}

/**
 * ApplicationForm component for adding or editing applications.
 *
 * @param {Object} props - Component properties.
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {Function} props.onClose - Callback function to close the dialog.
 * @param {Function} props.onSubmit - Callback function to handle form submission.
 * @param {Object} props.initialData - Initial data for the form when editing.
 * @param {boolean} props.isEditMode - Flag indicating if the form is in edit mode.
 * @param {Function} props.setHasUnsavedChanges - Callback function to set the unsaved changes flag.
 * @returns {JSX.Element} The rendered application form.
 */
const ApplicationForm: React.FC<ApplicationFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isEditMode,
  setHasUnsavedChanges,
  hasUnsavedChanges,
}): JSX.Element => {
  const navigate = useNavigate();
  const applicationSlug = initialData?.slug || "";
  const [formValues, setFormValues] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    image: initialData?.image || "",
  });
  const [errors, setErrors] = useState<{ name?: string; image?: string }>({});
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmNavigate, setConfirmNavigate] = useState(false);

  /**
   * Effect to reset form fields and errors when initial data changes or when the form is opened
   */
  useEffect(() => {
    if (open && !hasUnsavedChanges) {
      setFormValues({
        name: initialData?.name || "",
        description: initialData?.description || "",
        image: initialData?.image || "",
      });
      setErrors({});
      setHasUnsavedChanges(false);
    }
  }, [initialData, open, setHasUnsavedChanges]);

  /**
   * Handles change events for form fields and marks as modified when any field changes
   */
  const handleChange = (field: keyof typeof formValues, value: string) => {
    setFormValues((prev) => {
      const updatedValues = { ...prev, [field]: value };
      // Check if any field is different from the initial values
      const modified =
        updatedValues.name !== (initialData?.name ?? "") ||
        updatedValues.description !== (initialData?.description ?? "") ||
        updatedValues.image !== (initialData?.image ?? "");
      setHasUnsavedChanges(modified);
      console.log(updatedValues);
      return updatedValues;
    });
  };

  /**
   * Handles form submission and validation.
   */
  const handleSubmit = () => {
    const newErrors: { name?: string; image?: string } = {};

    // Validate required fields
    if (!formValues.name) {
      newErrors.name = "Please enter the application name.";
    }
    // Validate image only if not in edit mode
    if (!isEditMode && !formValues.image) {
      newErrors.image = "Please provide a Docker image.";
    }

    // If there are errors, set the errors state
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors and submit the form
    setErrors({});
    onSubmit({
      name: formValues.name,
      description: formValues.description,
      image: isEditMode ? undefined : formValues.image,
    }).then(() => {
      setHasUnsavedChanges(false);
      onClose(true);
    });
  };

  /**
   * Handles the request to close the form.
   * If there are unsaved changes, a confirmation dialog is shown.
   */
  const handleCloseRequest = () => {
    if (hasUnsavedChanges) {
      setConfirmClose(true);
    } else {
      onClose();
    }
  };

  /**
   * Confirms the closing of the form, proceeding to close it.
   */
  const handleConfirmClose = () => {
    setConfirmClose(false);
    setHasUnsavedChanges(false);
    onClose(true);
  };

  /**
   * Cancels the close request, keeping the form open.
   */
  const handleCancelClose = () => {
    setConfirmClose(false);
  };

  /**
   * Handles navigation to the application details page.
   * If there are unsaved changes, a confirmation dialog is shown.
   */
  const handleNavigate = () => {
    if (hasUnsavedChanges) {
      setConfirmNavigate(true); // Show confirmation dialog for navigation
    } else {
      navigate(`/applications/${applicationSlug}`);
    }
  };

  /**
   * Confirms the navigation to the application details page.
   */
  const handleConfirmNavigate = () => {
    setConfirmNavigate(false);
    setHasUnsavedChanges(false);
    navigate(`/applications/${applicationSlug}`);
  };

  /**
   * Cancels the navigation request, keeping the form open.
   */
  const handleCancelNavigate = () => {
    setConfirmNavigate(false);
  };

  return (
    <Box sx={{ p: 2, width: 400 }}>
      <Typography variant="h6" gutterBottom>
        {isEditMode ? "Edit Application" : "Create Application"}
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Use this form to manage your application. Fill in the required fields and provide a brief description. If you
        are creating a new application, please ensure you include the Docker image for deployment.
      </Typography>
      <TextField
        autoFocus
        margin="dense"
        label="Application Name"
        value={formValues.name}
        onChange={(e) => handleChange("name", e.target.value)}
        error={!!errors.name}
        helperText={errors.name}
        fullWidth
        required
      />
      <TextField
        margin="dense"
        label="Description"
        fullWidth
        value={formValues.description}
        onChange={(e) => handleChange("description", e.target.value)}
        multiline
        rows={4}
      />
      {!isEditMode && (
        <TextField
          margin="dense"
          label="Docker Image"
          value={formValues.image}
          onChange={(e) => handleChange("image", e.target.value)}
          error={!!errors.image}
          helperText={errors.image}
          fullWidth
          required
        />
      )}
      <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between" }}>
        <Button onClick={handleCloseRequest}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!hasUnsavedChanges}>
          {isEditMode ? "Save" : "Create"}
        </Button>
      </Box>
      {isEditMode && (
        <>
          <Divider sx={{ my: 1 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>
          <Box>
            <Typography variant="body2" gutterBottom>
              You can access more detailed options to modify the application directly.
            </Typography>
            <Button variant="outlined" onClick={handleNavigate} fullWidth>
              View/Edit Application Info
            </Button>
          </Box>
        </>
      )}

      {/* Confirmation Dialog for closing the form */}
      <ConfirmationDialog
        title="Unsaved Changes"
        message="Are you sure you want to close the form? Your changes will be lost."
        open={confirmClose}
        onCancel={handleCancelClose}
        onConfirm={handleConfirmClose}
      />

      {/* Confirmation Dialog for navigation */}
      <ConfirmationDialog
        title="Unsaved Changes"
        message="Are you sure you want to navigate away? Your changes will be lost."
        open={confirmNavigate}
        onCancel={handleCancelNavigate}
        onConfirm={handleConfirmNavigate}
      />
    </Box>
  );
};

export default ApplicationForm;
