import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiUpload, FiBarChart2 } from "react-icons/fi";

export default function StudioSidebar() {
  const location = useLocation();
  const links = [
    { name: "Home", icon: <FiHome />, path: "/" },
    { name: "Upload", icon: <FiUpload />, path: "/upload" },
    { name: "Dashboard", icon: <FiBarChart2 />, path: "/dashboard" },
  ];

  return (
    <aside className="w-64 bg-[#181818] border-r border-gray-800 flex flex-col">
      <div className="text-2xl font-bold text-red-500 p-6 border-b border-gray-800">
        AirStream Studio
      </div>
      <nav className="flex-1 p-4 flex flex-col gap-2">
        {links.map((l) => (
          <Link
            key={l.name}
            to={l.path}
            className={`flex items-center gap-3 p-3 rounded-lg hover:bg-[#222] transition ${
              location.pathname === l.path ? "bg-[#222] text-red-400" : "text-gray-300"
            }`}
          >
            {l.icon} {l.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
