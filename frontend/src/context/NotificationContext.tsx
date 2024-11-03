import React, { createContext, useContext, ReactNode } from "react";
import { SnackbarProvider, useSnackbar } from "notistack";
import { Alert } from "@mui/material";

interface NotificationContextType {
  addNotification: (message: string, severity: "success" | "error" | "warning" | "info") => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();

  const addNotification = (message: string, severity: "success" | "error" | "warning" | "info") => {
    enqueueSnackbar(message, {
      variant: severity,
      autoHideDuration: 3000,
    });
  };

  return <NotificationContext.Provider value={{ addNotification }}>{children}</NotificationContext.Provider>;
};

const CustomSnackbar = React.forwardRef(function CustomSnackbar(props: any, ref: React.Ref<HTMLDivElement>) {
  const { message, variant } = props;
  return (
    <Alert ref={ref} severity={variant}>
      {message}
    </Alert>
  );
});

// AppWrapper to include both Notification and Snackbar Providers
const AppWrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
  <SnackbarProvider
    maxSnack={5}
    Components={{
      success: CustomSnackbar,
      error: CustomSnackbar,
      warning: CustomSnackbar,
      info: CustomSnackbar,
    }}>
    <NotificationProvider>{children}</NotificationProvider>
  </SnackbarProvider>
);

export default AppWrapper;
