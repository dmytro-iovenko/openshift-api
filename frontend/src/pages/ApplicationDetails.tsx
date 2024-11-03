import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Typography, Box, Tabs, Tab } from "@mui/material";
import { Application } from "../types/Application";
import { fetchApplicationBySlug } from "../services/api";
import { useBreadcrumbs } from "../context/BreadcrumbsContext";
import { useNotification } from "../context/NotificationContext";
import Loader from "../components/Loader";
import ApplicationInfo from "../components/applications/ApplicationInfo";
import DeploymentTable from "../components/deployments/DeploymentTable";

/**
 * Renders detailed information about the application.
 * @returns {JSX.Element} The rendered component.
 */
const ApplicationDetails = (): JSX.Element => {
  const { slug } = useParams<{ slug: string }>();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { addNotification } = useNotification();
  const [application, setApplication] = useState<Application | null>(null);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  /**
   * Sets the breadcrumbs when the component mounts.
   */
  useEffect(() => {
    const breadcrumbs = [
      { label: "Applications", path: "/" },
      { label: slug || "Loading...", path: "#" },
    ];
    setBreadcrumbs(breadcrumbs);
  }, [slug, setBreadcrumbs]);

  /**
   * Fetches application details and deployments when the component mounts.
   */
  useEffect(() => {
    const getApplication = async () => {
      try {
        const app = await fetchApplicationBySlug(slug!);
        setApplication(app);
        setDeployments(app.deployments);
      } catch (error) {
        console.error("Failed to fetch application details:", error);
        addNotification("Failed to fetch application details.", "error");
      } finally {
        setLoading(false);
      }
    };
    getApplication();
  }, [slug]);

  /**
   * Handles tab change event.
   **/
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return <Loader />;
  }

  if (!application) {
    return <Typography variant="h6">Application not found</Typography>;
  }

  return (
    <Box p={3}>
      <Typography variant="h4">{application.name}</Typography>
      <Typography gutterBottom>{application.description}</Typography>

      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tab label="Basic Info" />
        <Tab label="Deployments" />
      </Tabs>
      <Box sx={{ marginTop: 2 }}>
        {activeTab === 0 && <ApplicationInfo application={application} />}
        {activeTab === 1 && <DeploymentTable deployments={deployments} loading={loading} />}
      </Box>
    </Box>
  );
};

export default ApplicationDetails;
