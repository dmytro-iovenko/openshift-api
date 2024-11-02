import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

/**
 * Represents the props for the ConfirmationDialog component.
 */
interface ConfirmationDialogProps {
  title: string;
  message: string;
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Represents the props for the ConfirmationDialog component.
 *
 * @param {string} title - The title of the dialog.
 * @param {string} message - The message to display in the dialog.
 * @property {boolean} open - Whether the dialog is open.
 * @property {() => void} onCancel - Callback function to cancel the dialog.
 * @property {() => void} onConfirm - Callback function to confirm the dialog.
 * @returns {JSX.Element} The rendered confirmation dialog.
 */
const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ title, message, open, onCancel, onConfirm }) => (
  <Dialog open={open} onClose={onCancel}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Typography variant="body2" gutterBottom>
        {message}
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button onClick={onConfirm} color="primary">
        Confirm
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmationDialog;
