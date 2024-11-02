import React from "react";
import { Link } from "react-router-dom";
import { Breadcrumbs, Typography } from "@mui/material";

/**
 * Represents a breadcrumb item.
 */
interface Breadcrumb {
  label: string;
  path?: string;
}

/**
 * Represents the breadcrumbs component.
 **/
interface BreadcrumbsComponentProps {
  breadcrumbs: Breadcrumb[];
}

/**
 * Represents the breadcrumbs component.
 *
 * @param {Breadcrumb[]} breadcrumbs - The breadcrumbs to display.
 * @returns {JSX.Element} The rendered breadcrumbs.
 **/
const BreadcrumbsComponent: React.FC<BreadcrumbsComponentProps> = ({ breadcrumbs }): JSX.Element => {
  return (
    <Breadcrumbs aria-label="breadcrumb">
      {breadcrumbs.map((breadcrumb, index) =>
        index === breadcrumbs.length - 1 ? (
          <Typography key={breadcrumb.path} color="text.primary">
            {breadcrumb.label}
          </Typography>
        ) : (
          <Link key={breadcrumb.path} to={breadcrumb.path || "#"}>
            {breadcrumb.label}
          </Link>
        )
      )}
    </Breadcrumbs>
  );
};

export default BreadcrumbsComponent;
