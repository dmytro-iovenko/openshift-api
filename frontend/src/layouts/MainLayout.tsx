import { DashboardLayout } from "@toolpad/core";
import { Outlet } from "react-router-dom";

/**
 * MainLayout component to wrap the main application content.
 * @returns {JSX.Element} The rendered main layout.
 */
export default function MainLayout() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
