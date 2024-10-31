import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";

interface DeploymentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; image: string }) => Promise<void>;
  initialData?: { name: string; image: string };
  isEditMode: boolean;
}

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
