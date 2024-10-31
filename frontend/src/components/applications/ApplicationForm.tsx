import { useEffect, useState } from "react";
import { TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

/**
 * Represents the application form.
 * 
 * @property {boolean} open - Whether the dialog is open.
 * @property {() => void} onClose - Callback function to close the dialog.
 * @property {(data: { name: string; description?: string; image?: string }) => Promise<void>} onSubmit - Callback function to handle form submission.
 * @property {{ name: string; description?: string; image?: string }} [initialData] - Initial data for the form when editing.
 * @property {boolean} isEditMode - Flag indicating if the form is in edit mode.
 */
interface ApplicationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; image?: string }) => Promise<void>;
  initialData?: { name: string; description?: string; image?: string };
  isEditMode: boolean;
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
 * @returns {JSX.Element} The rendered application form.
 */
const ApplicationForm: React.FC<ApplicationFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isEditMode,
}): JSX.Element => {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description);
  const [image, setImage] = useState(initialData?.image || "");
  const [errors, setErrors] = useState<{ name?: string; image?: string }>({});

  /**
   * Effect to reset form fields and errors when initial data changes.
   */
  useEffect(() => {
    setName(initialData?.name || "");
    setDescription(initialData?.description);
    setImage(initialData?.image || "");
    setErrors({});
  }, [initialData]);

  /**
   * Clear errors when the form is opened.
   */
  useEffect(() => {
    if (open) {
      setErrors({});
    }
  }, [open]);

  /**
   * Handles form submission and validation.
   */
  const handleSubmit = () => {
    const newErrors: { name?: string; image?: string } = {};

    // Validate required fields
    if (!name) {
      newErrors.name = "Application Name is required.";
    }
    // Validate image only if not in edit mode
    if (!isEditMode && !image) {
      newErrors.image = "Docker Image is required.";
    }

    // If there are errors, set the errors state
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors and submit the form
    setErrors({});
    onSubmit({ name, description, image: isEditMode ? undefined : image });
    onClose(); // Close the dialog after submission
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{isEditMode ? "Edit Application" : "Add Application"}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Application Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={4}
        />
        {!isEditMode && (
          <TextField
            margin="dense"
            label="Image"
            fullWidth
            value={image}
            onChange={(e) => setImage(e.target.value)}
            error={!!errors.image}
            helperText={errors.image}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>{isEditMode ? "Save" : "Add"}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApplicationForm;
