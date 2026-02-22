import { Outlet } from "react-router-dom";
import { useState } from "react";
import InstructorHeader from "../components/InstructorHeader";
import InstructorSideBar from "../components/InstructorSideBar";

export default function InstructorLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <>
      <InstructorHeader sidebarCollapsed={sidebarCollapsed} />
      <InstructorSideBar onCollapseChange={handleSidebarCollapse} />
      <Outlet context={{ sidebarCollapsed }} />
    </>
  );
}