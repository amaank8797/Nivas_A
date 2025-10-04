import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar/HotelManagerSidebar"
import "./ManagerLayout.css";

export default function ManagerLayout() {
  return (
    <div className="manager-shell">
      {/* Fixed top header */}

      {/* Fixed left sidebar */}
      <aside className="manager-sidebar">
        <Sidebar />
      </aside>

      {/* Main content area */}
      <main className="manager-main">
        <div className="container-narrow">
          <Outlet /> {/* This renders nested pages like ManageHotel */}
        </div>
      </main>
    </div>
  );
}