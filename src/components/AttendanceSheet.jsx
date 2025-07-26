import { useState, useEffect, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore"; // No need for 'query' or 'where' here for this specific fetch
import { db } from "../firebase"; // Assuming your firebase config is here

const Attendance = () => {
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("July");
  const [members, setMembers] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 11 }, (_, i) => String(2025 + i));

  useEffect(() => {
    const monthIndex = months.findIndex(
      (m) => m.toLowerCase() === month.toLowerCase()
    );
    const days = new Date(Number(year), monthIndex + 1, 0).getDate();
    setDaysInMonth(Array.from({ length: days }, (_, i) => i + 1));
  }, [year, month]);

  // Fetch members with attendance - Corrected Optimized Approach
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const membersCollectionRef = collection(db, "members");
      const snapshot = await getDocs(membersCollectionRef); // Fetch all member documents

      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        // Directly access the nested attendance for the selected year and month
        // This is the most efficient way when you need to display all members
        // and their specific monthly attendance.
        const attendance = d.attendance?.[year]?.[month] || [];
        return {
          roll_no: d.roll_no,
          name: d.name || "Unnamed",
          attendance: attendance, // This will be an array of numbers (days attended)
        };
      });
      setMembers(data);
    } catch (error) {
      console.error("Error fetching members: ", error);
      setError("Failed to load attendance data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [year, month]); // Dependencies for refetching when year or month changes

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]); // Dependency on the memoized fetchMembers function

  return (
    <div className="p-4 overflow-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Attendance Sheet</h2>

      {/* Year & Month Dropdowns */}
      <div className="flex gap-4 mb-4 justify-center">
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border px-3 py-1 rounded"
          disabled={loading}
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
          disabled={loading}
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center text-blue-600 mb-4">Loading attendance data...</div>
      )}
      {error && (
        <div className="text-center text-red-600 mb-4">Error: {error}</div>
      )}

      {/* Attendance Table */}
      {!loading && !error && (
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
                        className={`border p-1 ${member.attendance.includes(day) ? "text-green-600 font-semibold" : ""}`}
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
      )}
    </div>
  );
};

export default Attendance;