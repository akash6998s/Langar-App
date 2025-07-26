import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { name: "Home", path: "/", icon: "home" },
  { name: "Activity", path: "/activity", icon: "insights" },
  { name: "Members", path: "/members", icon: "group" },
  { name: "Profile", path: "/profile", icon: "person" },
];

const Header = () => {
  return (
    <>
      {/* Desktop Header */}
      <div className="hidden md:flex justify-between items-center px-6 py-4 bg-white shadow fixed top-0 left-0 right-0 z-50">
        <div className="text-xl font-bold text-indigo-600">LangarSewa</div>
        <div className="flex space-x-6 text-gray-700 font-medium">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "text-indigo-600 font-semibold" : "hover:text-indigo-600"
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow z-50">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `text-sm flex flex-col items-center ${
                  isActive ? "text-indigo-600 font-semibold" : "text-gray-700"
                }`
              }
            >
              <span className="material-icons">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
};

export default Header;
