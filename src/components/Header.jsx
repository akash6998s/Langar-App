import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { name: "Home", path: "/home", icon: "home" },
  { name: "Activity", path: "/activity", icon: "insights" },
  { name: "Members", path: "/members", icon: "group" },
  { name: "Profile", path: "/profile", icon: "person" },
];

const Header = () => {
  const loggedInMember = JSON.parse(localStorage.getItem("loggedInMember"));
  const isSuperAdmin = loggedInMember?.isAdmin === true;

  const fullNavItems = isSuperAdmin
    ? [...navItems, { name: "SuperAdmin", path: "/superadmin", icon: "shield" }]
    : navItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow z-50">
      <div className="flex justify-around items-center h-[10vh]">
        {fullNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `text-xs flex flex-col items-center p-2 rounded-lg transition-colors duration-200
              ${isActive ? "text-indigo-700 font-semibold bg-indigo-50" : "text-gray-600 hover:bg-gray-100"}`
            }
          >
            <span className="material-icons text-xl mb-1">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Header;
