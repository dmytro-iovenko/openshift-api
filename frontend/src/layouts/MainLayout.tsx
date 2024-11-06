import { DashboardLayout } from "@toolpad/core";
import { Outlet } from "react-router-dom";
import SidebarAvatar from "../components/SidebarAvatar";
import ToolbarButtons from "../components/ToolbarButtons";

/**
 * MainLayout component to wrap the main application content.
 * @returns {JSX.Element} The rendered main layout.
 */
export default function MainLayout() {
  return (
    <DashboardLayout slots={{ toolbarActions: ToolbarButtons, sidebarFooter: SidebarAvatar }}>
      <Outlet />
    </DashboardLayout>
  );
}
