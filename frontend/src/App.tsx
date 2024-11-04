import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import theme from "./themes/theme";
import MainLayout from "./layouts/MainLayout";
import Applications from "./pages/Applications";
import ApplicationDetails from "./pages/ApplicationDetails";
import BreadcrumbsProvider from "./context/BreadcrumbsContext";
import NotificationProvider from "./context/NotificationContext";
import Deployments from "./pages/Deployments";

/**
 * Main application component that sets up the theme and layout.
 * @returns {JSX.Element} The main application UI.
 */
const App: React.FC = (): JSX.Element => (
  <ThemeProvider theme={theme("light")}>
    <BreadcrumbsProvider>
      <NotificationProvider>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Applications />} />
              <Route path="/applications/:slug" element={<ApplicationDetails />} />
              <Route path="/deployments" element={<Deployments />} />
            </Routes>
          </MainLayout>
        </Router>
      </NotificationProvider>
    </BreadcrumbsProvider>
  </ThemeProvider>
);

export default App;
