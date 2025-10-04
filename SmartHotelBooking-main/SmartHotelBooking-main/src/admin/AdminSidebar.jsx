// src/admin/AdminSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function AdminSidebar({ open, onClose }) {
  const items = [
    { to: "/admin", label: "Manage Hotel Manager", exact: true },
    { to: "/admin/manage-user", label: "Manage Users" },
    { to: "/admin/manage-reviews", label: "Manage Reviews" },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 lg:z-0  w-[220px] bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static
        `}
      >
        {/* Header with close button (mobile only) */}
        <div className="flex items-center justify-between px-4 py-3 border-b md:hidden">
          <h2 className="text-lg font-bold text-gray-800">Admin Panel</h2>
          <button
            aria-label="Close sidebar"
            className="text-gray-600 hover:text-gray-900"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-3 p-4">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.exact}
              onClick={() => {
                if (window.innerWidth < 1000) onClose();
              }}
              className={({ isActive }) =>
                [
                  "block no-underline px-4 py-3 rounded-lg font-semibold border border-transparent",
                  "text-gray-700 hover:bg-gray-100",
                  isActive
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "",
                ].join(" ")
              }
            >
              {it.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
