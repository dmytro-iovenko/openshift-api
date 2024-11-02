import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import theme from "./themes/theme";
import MainLayout from "./layouts/MainLayout";
import Applications from "./pages/Applications";
import ApplicationDetails from "./pages/ApplicationDetails";

/**
 * Main application component that sets up the theme and layout.
 * @returns {JSX.Element} The main application UI.
 */
const App: React.FC = (): JSX.Element => (
  <ThemeProvider theme={theme("light")}>
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Applications />} />
          <Route path="/applications/:slug" element={<ApplicationDetails />} />
        </Routes>
      </MainLayout>
    </Router>
  </ThemeProvider>
);

export default App;
