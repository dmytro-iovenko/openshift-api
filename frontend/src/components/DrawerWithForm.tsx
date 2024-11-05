import React from "react";
import { Drawer, Toolbar, IconButton, useTheme, useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

/**
 * Interface for the props of the DrawerWithForm component.
 * This interface defines the expected properties that the DrawerWithForm component should receive.
 */
interface DrawerWithFormProps {
  open: boolean; // Controls whether the drawer is open or closed
  onClose: () => void; // Callback function to close the drawer
  formComponent: React.ReactNode; // A React component to render as the form
  drawerWidth?: string; // Optionally allow the parent to specify the width
}

/**
 * DrawerWithForm component
 * A reusable drawer component that automatically adjusts its width based on screen size.
 *
 * @param {boolean} open - Controls whether the drawer is open or closed.
 * @param {() => void} onClose - Callback function to close the drawer.
 * @param {React.ReactNode} formComponent - The form component (or any content) to be displayed inside the drawer.
 * @param {string} [drawerWidth] - Optional custom width for the drawer. If not provided, the width will be automatically calculated.
 *
 * @returns {JSX.Element} The DrawerWithForm component.
 */
const DrawerWithForm: React.FC<DrawerWithFormProps> = ({
  open,
  onClose,
  formComponent,
  drawerWidth: customDrawerWidth,
}) => {
  // Get theme and media query for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Default drawer width calculation, mobile uses 100% and desktop uses custom or 600px
  const drawerWidth = customDrawerWidth || (isMobile ? "100%" : "600px");

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth },
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}>
      {/* Close Button */}
      <Toolbar sx={{ display: "flex", justifyContent: "flex-end" }}>
        <IconButton onClick={onClose} edge="end" color="inherit">
          <CloseIcon />
        </IconButton>
      </Toolbar>

      {/* Form Component */}
      {formComponent}
    </Drawer>
  );
};

export default DrawerWithForm;
