import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../contextApi/AuthContext";
import { SideBarContext } from "../contextApi/sidebar/SideBarContext";

export default function Navbar() {
  const { isLoggedIn, logout,user } = useContext(AuthContext);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { toggleSidebar } = useContext(SideBarContext);

const dashboardCondition =
  location.pathname.startsWith("/admin") ||
  location.pathname.startsWith("/user") ||
  location.pathname.startsWith("/hotelmanager");


  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {dashboardCondition && (
            <button
              className="p-2 border rounded lg:hidden"
              onClick={toggleSidebar}
            >
              ☰
            </button>
          )}
          <Link to="/" className="text-2xl font-bold text-amber-700">
            Atithi_Nivas
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex space-x-6">
          <Link to="/" className="hover:text-amber-600">Home</Link>
          <Link to="/hotels" className="hover:text-amber-600">Hotels</Link>
          <Link to={`/${user?.role}`} className="hover:text-amber-600">Dashboard</Link>
          <Link to="/offers" className="hover:text-amber-600">Offers</Link>
          <Link to="/about" className="hover:text-amber-600">About</Link>
          <Link to="/contact" className="hover:text-amber-600">Contact</Link>
          {!isLoggedIn && (
            <Link to="/auth" className="hover:text-amber-600">Login</Link>
          )}
          {isLoggedIn && (
            <button onClick={logout} className="hover:text-amber-600">Logout</button>
          )}
        </div>

        <button
          className="lg:hidden p-2 border rounded"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="lg:hidden bg-white shadow-md flex flex-col space-y-4 p-4">
          <Link to="/" className="hover:text-amber-600" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/hotels" className="hover:text-amber-600" onClick={() => setMenuOpen(false)}>Hotels</Link>
          <Link to={`/${user?.role}`} className="hover:text-amber-600" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link to="/offers" className="hover:text-amber-600" onClick={() => setMenuOpen(false)}>Offers</Link>
          <Link to="/about" className="hover:text-amber-600" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/contact" className="hover:text-amber-600" onClick={() => setMenuOpen(false)}>Contact</Link>
          {!isLoggedIn && (
            <Link to="/auth" className="hover:text-amber-600" onClick={() => setMenuOpen(false)}>Login</Link>
          )}
          {isLoggedIn && (
            <button onClick={() => { logout(); setMenuOpen(false); }} className="hover:text-amber-600">
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
