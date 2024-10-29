import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import theme from './themes/theme';
import MainLayout from './layouts/MainLayout';
import Applications from './pages/Applications';

/**
 * Main application component that sets up the theme and layout.
 * @returns {JSX.Element} The main application UI.
 */
const App: React.FC = (): JSX.Element => (
  <ThemeProvider theme={theme('light')}>
    <MainLayout>
      <Applications />
    </MainLayout>
  </ThemeProvider>
);

export default App;
