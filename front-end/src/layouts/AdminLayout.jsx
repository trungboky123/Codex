import { Outlet } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSideBar";
import { useState } from "react";

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <>
      <AdminHeader sidebarCollapsed={sidebarCollapsed} />
      <AdminSidebar onCollapseChange={handleSidebarCollapse} />
      <Outlet context={{ sidebarCollapsed }} />
    </>
  );
}
