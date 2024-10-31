import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";

/**
 * Represents the props for the DeploymentForm component.
 *
 * @property {boolean} open - Whether the dialog is open.
 * @property {() => void} onClose - Callback function to close the dialog.
 * @property {(data: { name: string; image: string }) => Promise<void>} onSubmit - Callback function to handle form submission.
 * @property {{ name: string; image: string }} [initialData] - Initial data for the form when editing.
 * @property {boolean} isEditMode - Flag indicating if the form is in edit mode.
 */
interface DeploymentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; image: string }) => Promise<void>;
  initialData?: { name: string; image: string };
  isEditMode: boolean;
}

/**
 * DeploymentForm component for adding or editing deployments.
 *
 * @param {DeploymentFormProps} props - Component properties.
 * @returns {JSX.Element} The rendered deployment form.
 */
const DeploymentForm: React.FC<DeploymentFormProps> = ({ open, onClose, onSubmit, initialData }) => {
  const [name, setName] = useState(initialData?.name || "");
  const [image, setImage] = useState(initialData?.image || "");

  const handleSubmit = () => {
    onSubmit({ name, image });
    onClose();
  };

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setImage(initialData.image);
    }
  }, [initialData]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{initialData ? "Edit Deployment" : "Add Deployment"}</DialogTitle>
      <DialogContent>
        <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="Image" value={image} onChange={(e) => setImage(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
};
