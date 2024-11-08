import React, { createContext, useContext, ReactNode } from "react";
import { useNotifications } from "@toolpad/core";

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
  const notifications = useNotifications();

  const addNotification = (message: string, severity: "success" | "error" | "warning" | "info") => {
    notifications.show(message, {
      severity: severity,
      autoHideDuration: 3000,
    });
  };

  return <NotificationContext.Provider value={{ addNotification }}>{children}</NotificationContext.Provider>;
};

const AppWrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
  <NotificationProvider>{children}</NotificationProvider>
);

export default AppWrapper;
