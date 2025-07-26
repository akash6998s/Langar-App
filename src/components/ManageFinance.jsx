import { useEffect, useState } from "react";
import Summary from "./Summary";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const years = ["2024", "2025"];

export default function ManageFinance() {
  const [activeTab, setActiveTab] = useState("donation");

  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedMonth, setSelectedMonth] = useState("May");

  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const allMembers = JSON.parse(sessionStorage.getItem("allMembers")) || [];

    const donationList = allMembers.map((member) => {
      const donationData = member?.donation?.[selectedYear]?.[selectedMonth];
      let amount = 0;

      if (typeof donationData === "number") {
        amount = donationData;
      } else if (Array.isArray(donationData)) {
        amount = donationData.reduce((sum, val) => sum + Number(val || 0), 0);
      }

      return {
        roll: member.roll_no || member.id || "-",
        name: member.name || "Unknown",
        amount: amount
      };
    });

    setDonations(donationList);
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    const expenseData = JSON.parse(sessionStorage.getItem("expenses")) || {};
    const expensesList = expenseData?.[selectedYear]?.[selectedMonth] || [];
    setExpenses(expensesList);
  }, [selectedYear, selectedMonth]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
        <Summary/>
      {/* Tabs */}
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setActiveTab("donation")}
          className={`px-4 py-2 rounded ${
            activeTab === "donation" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Donation
        </button>
        <button
          onClick={() => setActiveTab("expense")}
          className={`px-4 py-2 rounded ${
            activeTab === "expense" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Expense
        </button>
      </div>

      {/* Dropdowns */}
      <div className="flex gap-4 mb-4">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border px-3 py-1 rounded"
        >
          {years.map((year) => (
            <option key={year}>{year}</option>
          ))}
        </select>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border px-3 py-1 rounded"
        >
          {months.map((month) => (
            <option key={month}>{month}</option>
          ))}
        </select>
      </div>

      {/* Donation Tab */}
      {activeTab === "donation" && (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Roll Number</th>
                <th className="border px-3 py-2 text-left">Name</th>
                <th className="border px-3 py-2 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {donations.length > 0 ? (
                donations.map((d, index) => (
                  <tr key={index}>
                    <td className="border px-3 py-2">{d.roll}</td>
                    <td className="border px-3 py-2">{d.name}</td>
                    <td className="border px-3 py-2">{d.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="border px-3 py-2" colSpan="3">
                    No donation data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Expense Tab */}
      {activeTab === "expense" && (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Description</th>
                <th className="border px-3 py-2 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length > 0 ? (
                expenses.map((e, index) => (
                  <tr key={index}>
                    <td className="border px-3 py-2">{e.description}</td>
                    <td className="border px-3 py-2">{e.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="border px-3 py-2" colSpan="2">
                    No expense data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
