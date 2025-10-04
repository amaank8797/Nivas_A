import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { SideBarContext } from "../contextApi/sidebar/SideBarContext";

export default function AdminLayout() {
  const { sidebarOpen, toggleSidebar } = useContext(SideBarContext);

  return (
    <div className="min-h-screen flex">
      <AdminSidebar open={sidebarOpen} onClose={toggleSidebar} />
      <main
        className={`
          bg-[#fafafa]
      box-border
      h-screen
      overflow-y-auto
      w-full
        `}
      >
        <div className="w-full mx-auto px-6 py-5 box-border">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
