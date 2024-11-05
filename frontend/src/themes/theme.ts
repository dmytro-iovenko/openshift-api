import { createTheme, Theme } from "@mui/material/styles";

/**
 * Creates a MUI theme with the specified mode.
 * @param {string} mode - The theme mode ('light' or 'dark').
 * @returns {Theme} The created theme object.
 */
const theme = (mode: "light" | "dark"): Theme =>
  createTheme({
    colorSchemes: {
      light: true,
      dark: true,
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
        // xxl: 1800,
      },
    },
    palette: {
      mode,
      primary: {
        main: "#1976d2",
      },
    },
  });

export default theme;
