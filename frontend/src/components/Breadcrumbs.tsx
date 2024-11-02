import React from "react";
import { Link } from "react-router-dom";
import { Breadcrumbs, Typography } from "@mui/material";

/**
 * Represents the breadcrumbs component.
 **/
interface BreadcrumbsComponentProps {
  applicationName: string; // The name of the application.
}

/**
 * Represents the breadcrumbs component.
 *
 * @param {string} applicationName - The name of the application.
 * @returns {JSX.Element} The rendered breadcrumbs.
 **/
const BreadcrumbsComponent: React.FC<BreadcrumbsComponentProps> = ({ applicationName }): JSX.Element => {
  return (
    <Breadcrumbs aria-label="breadcrumb">
      <Link to="/">Applications</Link>
      <Typography color="text.primary">{applicationName}</Typography>
    </Breadcrumbs>
  );
};

export default BreadcrumbsComponent;
