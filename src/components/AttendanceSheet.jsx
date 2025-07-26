import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Assuming your firebase config is here

const Attendance = () => {
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("July");
  const [members, setMembers] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState([]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Corrected: Generate years from 2025 to 2035
  const years = Array.from({ length: 11 }, (_, i) => String(2025 + i)); // 2025, 2026, ..., 2035

  // Get total days in selected month
  useEffect(() => {
    const monthIndex = months.findIndex(
      (m) => m.toLowerCase() === month.toLowerCase()
    );
    // Note: If monthIndex is -1 (shouldn't happen with correct data), new Date() can be problematic.
    // However, given your fixed `months` array, this is generally safe.
    const days = new Date(Number(year), monthIndex + 1, 0).getDate();
    setDaysInMonth(Array.from({ length: days }, (_, i) => i + 1));
  }, [year, month, months]); // Added 'months' to dependency array for completeness, though it's constant.

  // Fetch members with attendance
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "members"));
        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          // Safely access attendance, defaulting to an empty array if not found
          const attendance = d.attendance?.[year]?.[month] || [];
          return {
            roll_no: d.roll_no,
            name: d.name || "Unnamed", // Provide a fallback for name
            attendance: attendance,
          };
        });
        setMembers(data);
      } catch (error) {
        console.error("Error fetching members: ", error);
        // Optionally handle error in UI, e.g., set an error state
      }
    };
    fetchMembers();
  }, [year, month]); // Dependencies for refetching when year or month changes

  return (
    <div className="p-4 overflow-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Attendance Sheet</h2>

      {/* Year & Month Dropdowns */}
      <div className="flex gap-4 mb-4 justify-center">
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border px-3 py-1 rounded"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border px-3 py-1 rounded"
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Attendance Table */}
      <div className="overflow-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">Roll No</th>
              <th className="border p-2">Name</th>
              {daysInMonth.map((day) => (
                <th key={day} className="border px-2 text-center">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Display message if no members are fetched */}
            {members.length === 0 ? (
              <tr>
                <td colSpan={daysInMonth.length + 2} className="text-center p-4 text-gray-500">
                  No members found or attendance data for the selected period.
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.roll_no} className="text-center">
                  <td className="border p-1">{member.roll_no}</td>
                  <td className="border p-1 text-left">{member.name}</td>
                  {daysInMonth.map((day) => (
                    <td
                      key={day}
                      className="border p-1 text-green-600 font-semibold"
                    >
                      {member.attendance.includes(day) ? "✔" : ""}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;