import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({ open, onClose }) {
  const items = [
    { to: "/user", label: "Profile", exact: true },
    { to: "bookings", label: "My Bookings" },
    { to: "loyalty", label: "Loyalty Points" },
    { to: "reviews", label: "Reviews" },
  ];

  return (
    <>
      {open && <div className="guest-overlay" onClick={onClose} />}

      <aside
        className={`guest-sidebar-drawer ${open ? "open" : ""}`}
        aria-hidden={!open}
      >
        <nav className="sidebar-nav">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.exact}   // 👈 only exact match for Profile
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
              onClick={() => {
  if (window.innerWidth < 1000) onClose();
}}

            >
              {it.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
