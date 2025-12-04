import React from "react";
import { FiBell, FiUser } from "react-icons/fi";

export default function StudioHeader() {
  return (
    <header className="h-16 bg-[#121212] border-b border-gray-800 flex justify-between items-center px-6">
      <h2 className="text-lg font-semibold text-gray-200">🎬 Creator Dashboard</h2>

      <div className="flex items-center gap-6">
        <FiBell className="text-xl text-gray-400 hover:text-red-400 cursor-pointer" />
        <div className="flex items-center gap-2">
          <img
            src="https://ui-avatars.com/api/?name=Vineet+Yadav&background=red&color=fff"
            alt="user"
            className="w-8 h-8 rounded-full"
          />
          <FiUser className="text-gray-400" />
        </div>
      </div>
    </header>
  );
}
