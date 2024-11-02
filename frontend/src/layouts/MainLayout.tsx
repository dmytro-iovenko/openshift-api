import React from "react";
import BreadcrumbsComponent from "../components/Breadcrumbs";
import { useBreadcrumbs } from "../context/BreadcrumbsContext";

/**
 * MainLayout component to wrap the main application content.
 * @param {React.PropsWithChildren} props - Children components to render inside the layout.
 * @returns {JSX.Element} The layout containing children components.
 */
const MainLayout: React.FC<React.PropsWithChildren> = ({ children }: React.PropsWithChildren): JSX.Element => {
  const { breadcrumbs } = useBreadcrumbs();

  return (
    <div>
      <BreadcrumbsComponent
        breadcrumbs={breadcrumbs.length > 0 ? breadcrumbs : [{ label: "Applications", path: "/" }]}
      />
      {children}
    </div>
  );
};

export default MainLayout;
