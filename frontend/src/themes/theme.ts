import { createTheme, Theme } from '@mui/material/styles';

/**
 * Creates a MUI theme with the specified mode.
 * @param {string} mode - The theme mode ('light' or 'dark').
 * @returns {Theme} The created theme object.
 */
const theme = (mode: 'light' | 'dark'): Theme => createTheme({
  palette: {
    mode,
    primary: {
      main: '#1976d2',
    },
  },
});

export default theme;
