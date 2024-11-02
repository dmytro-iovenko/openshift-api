import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Typography, Box, Tabs, Tab } from "@mui/material";
import { Application } from "../types/Application";
import { fetchApplicationBySlug, fetchDeployments } from "../services/api";
import Loader from "../components/Loader";
import BreadcrumbsComponent from "../components/Breadcrumbs";
import ApplicationInfo from "../components/applications/ApplicationInfo";
import DeploymentTable from "../components/deployments/DeploymentTable";

/**
 * Represents detailed information about the application.
 *
 * @property {Application} application - The application data to display.
 */
interface ApplicationDetailsProps {
  // application: Application;
}

/**
 * Renders detailed information about the application.
 *
 * @returns {JSX.Element} The rendered component.
 */
const ApplicationDetails: React.FC<ApplicationDetailsProps> = (): JSX.Element => {
  const { slug } = useParams<{ slug: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getApplication = async () => {
      try {
        const app = await fetchApplicationBySlug(slug!);
        setApplication(app);
        try {
          const data = await fetchDeployments(app._id);
          setDeployments(data);
        } catch (error) {
          console.error("Failed to fetch deployments:", error);
        }
      } catch (error) {
        console.error("Failed to fetch application details:", error);
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
      <BreadcrumbsComponent applicationName={application.name} />
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
