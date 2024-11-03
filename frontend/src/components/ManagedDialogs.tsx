import React, { useState } from "react";
import ConfirmationDialog from "../components/ConfirmationDialog";
import _ from "lodash";

interface ManagedDialogsProps {
  itemType: string;
  children: (showDialog: (dialogType: string, confirmCallback: () => void) => void) => React.ReactNode;
}

const ManagedDialogs: React.FC<ManagedDialogsProps> = ({ itemType, children }) => {
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [confirmCallback, setConfirmCallback] = useState<(() => void) | null>(null);

  const handleShowDialog = (dialogType: string, callback: () => void) => {
    setOpenDialog(dialogType);
    setConfirmCallback(() => callback);
  };

  const handleCancel = () => {
    setOpenDialog(null);
    setConfirmCallback(null);
  };

  const handleConfirm = () => {
    if (confirmCallback) {
      confirmCallback();
      setOpenDialog(null);
      setConfirmCallback(null);
    }
  };

  let title, message;
  switch (openDialog) {
    case "confirmClose":
      title = "Unsaved Changes";
      message = "Are you sure you want to close the form? Your changes will be lost.";
      break;
    case "confirmNavigate":
      title = "Unsaved Changes";
      message = "You have unsaved changes. Are you sure you want to navigate away? Your changes will be lost.";
      break;
    case "confirmDelete":
      title = `Delete ${_.capitalize(itemType)}`;
      message = `Are you sure you want to delete this ${_.lowerCase(itemType)}?`;
      break;
    default:
      title = "";
      message = "";
  }

  return (
    <>
      {children(handleShowDialog)}
      <ConfirmationDialog
        title={title}
        message={message}
        open={!!title}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </>
  );
};

export default ManagedDialogs;
