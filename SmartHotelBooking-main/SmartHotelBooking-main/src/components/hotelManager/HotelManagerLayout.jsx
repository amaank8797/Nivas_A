import { useContext } from "react";
import { SideBarContext } from "../../contextApi/sidebar/SideBarContext";
import ManagerSidebar from "./Sidebar/ManagerSidebar";
import { Outlet } from "react-router-dom";
import HotelManagerSidebar from "./Sidebar/ManagerSidebar";

export default function HotelManagerLayout() {
  const { sidebarOpen, toggleSidebar } = useContext(SideBarContext);

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
            <div className="w-full mx-auto px-6 py-5 box-border">
              <Outlet />
            </div>
          </main>
        </div>
  );
}
