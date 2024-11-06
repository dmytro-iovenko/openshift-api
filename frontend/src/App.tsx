import ViewInArOutlinedIcon from "@mui/icons-material/ViewInArOutlined";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import { LiaCubeSolid, LiaCubesSolid } from "react-icons/lia";
import { Outlet } from "react-router-dom";
import { AppProvider } from "@toolpad/core/react-router-dom";
import { type Navigation } from "@toolpad/core/AppProvider";
import { IconButton, ThemeProvider } from "@mui/material";
import { NotificationProvider } from "./context/NotificationContext";
import theme from "./themes/theme";
import { AuthProvider } from "./context/AuthContext";

// Navigation structure
const navigation: Navigation = [
  { segment: "applications", title: "Applications", icon: <AppsOutlinedIcon />, pattern: "/applications/:slug" },
  { segment: "deployments", title: "Deployments", icon: <LiaCubesSolid size={24} />, pattern: "/deployments/:name" },
  { segment: "pods", title: "Pods", icon: <LiaCubeSolid size={24} />, pattern: "/pods/:name" },
];

// Branding
const branding = {
  logo: (
    <IconButton color="primary" sx={{ py: 0 }}>
      <ViewInArOutlinedIcon sx={{ width: "40px", height: "40px" }} />
    </IconButton>
  ),
  title: "ShiftHub",
};

/**
 * Main application component that sets up the theme and layout.
 * @returns {JSX.Element} The main application UI.
 */
export default function App() {
  return (
    <ThemeProvider theme={theme("light")}>
      <AuthProvider>
        <AppProvider navigation={navigation} branding={branding}>
          <NotificationProvider>
            <Outlet />
          </NotificationProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
