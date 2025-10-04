// layouts/HotelManagerLayout.jsx
import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import HotelManagerSidebar from './HotelManagerDashboard'
import { SideBarContext } from "../../contextApi/sidebar/SideBarContext";

export default function HotelManagerLayout() {
  const {sidebarOpen,toggleSidebar}=useContext(SideBarContext);
  
    return (
      <div className="min-h-screen flex">
  <HotelManagerSidebar open={sidebarOpen} onClose={toggleSidebar} />
  <main
    className={`
      bg-[#fafafa]
      box-border
      h-screen
      overflow-y-auto
      w-full
    `}
  >
    <div className="w-full px-6 py-5 box-border">
      <Outlet />
    </div>
  </main>
</div>

    );
}
