import React from "react";
import { Typography } from "@mui/material";
import { Application } from "../../types/Application";

/**
 * Represents detailed information about the application.
 *
 * @property {Application} application - The application data to display.
 */
interface ApplicationDetailsProps {
  application: Application;
}

/**
 * Renders detailed information about the application.
 *
 * @param {ApplicationDetailsProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({ application }) => {
  return (
    <div>
      <Typography variant="h6">Application Details</Typography>
      <Typography>Description: {application.description}</Typography>
      <Typography>Docker Image: {application.image}</Typography>
      <Typography>Deployments: {application.deployments.length}</Typography>
      <Typography>Created At: {new Date(application.createdAt).toLocaleString()}</Typography>
      <Typography>Updated At: {new Date(application.updatedAt).toLocaleString()}</Typography>
    </div>
  );
};

export default ApplicationDetails;
