import React, { useState } from "react";
import ManageAttendance from "../components/ManageAttendance";
import ManageDonation from "../components/ManageDonation";
import ManageExpense from "../components/ManageExpense";
import Managemember from "../components/Managemember";
import ManageFinance from "../components/ManageFinance"; // Import the new component

const navItems = [
  { name: "Manage Member", key: "member", icon: "group" },
  { name: "Manage Attendance", key: "attendance", icon: "fact_check" },
  { name: "Manage Donations", key: "donations", icon: "volunteer_activism" },
  { name: "Manage Expense", key: "expense", icon: "money_off" },
  { name: "Manage Finance", key: "finance", icon: "currency_exchange" }, // Added Manage Finance
];

const SuperAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("member");

  const toggleSidebar = () => setIsOpen(!isOpen);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "member":
        return <Managemember />;
      case "attendance":
        return <ManageAttendance />;
      case "donations":
        return <ManageDonation />;
      case "expense":
        return <ManageExpense />;
      case "finance": // New case for ManageFinance
        return <ManageFinance />;
      default:
        return <div>Select a section from the sidebar</div>;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        <div className="flex justify-between items-center p-4 border-b bg-white">
          <div className="font-bold text-indigo-600 text-xl">Super Admin</div>
          <button
            onClick={toggleSidebar}
            className="md:hidden text-gray-600 hover:text-red-500"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-4">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveTab(item.key);
                setIsOpen(false);
              }}
              className={`flex items-center gap-2 text-left ${
                activeTab === item.key
                  ? "text-indigo-600 font-semibold"
                  : "text-gray-700 hover:text-indigo-600"
              }`}
            >
              <span className="material-icons">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white shadow fixed top-0 left-0 right-0 z-30">
          <button onClick={toggleSidebar}>
            <span className="material-icons text-2xl">
              {isOpen ? "menu_open" : "menu"}
            </span>
          </button>
          <div className="text-lg font-bold text-indigo-600">Super Admin</div>
          <div className="w-6" />
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block p-4 bg-white shadow">
          <h1 className="text-xl font-semibold text-indigo-600">
            Super Admin Panel
          </h1>
        </div>

        {/* Dynamic Component Area */}
        <div className="mt-16 md:mt-0 p-4">{renderActiveComponent()}</div>
      </div>
    </div>
  );
};

export default SuperAdmin;