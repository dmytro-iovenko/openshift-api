import React from "react";
import { Typography } from "@mui/material";
import { Application } from "../../types/Application";

interface ApplicationDetailsProps {
  application: Application;
}

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
