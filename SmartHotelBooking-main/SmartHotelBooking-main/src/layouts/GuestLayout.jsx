import React, { useContext} from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar";
import { SideBarContext } from "../contextApi/sidebar/SideBarContext";

export default function GuestLayout() {
  const {sidebarOpen,toggleSidebar}=useContext(SideBarContext);

  return (
    <div className="min-h-screen">
      {/* Navbar (fixed at top, height 64px) */}

      {/* Sidebar drawer (mobile) / fixed (desktop) */}
      <Sidebar open={sidebarOpen} onClose={toggleSidebar} />

      {/* Main content area — the only vertical-scrolling element */}
      <main
  className={`
    bg-[#fafafa] 
    box-border 
    pt-16
    h-[calc(100vh-64px)]
    min-h-[calc(100vh-64px)]
    overflow-y-auto
    md:ml-[220px]
  `}
  onClick={() => {
    if (sidebarOpen) toggleSidebar();
  }}
>
  <div className="w-full mx-auto px-6 py-5 box-border">
    <Outlet />
  </div>
</main>

    </div>
  );
}
