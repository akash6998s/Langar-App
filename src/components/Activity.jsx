import { useEffect, useState } from "react";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const years = Array.from({ length: 11 }, (_, i) => 2025 + i); // 2025–2035

// maxDays is a constant because the table headers always show up to 31 days.
// It does not need to be part of React state if it's not going to change.
const maxDays = 31; // For consistent table headers displaying up to 31 days

const Activity = () => {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [memberData, setMemberData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("loggedInMember");
    if (stored) {
      setMemberData(JSON.parse(stored));
    }
  }, []); // Empty dependency array means this runs once on component mount

  return (
    <div className="p-4 overflow-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Activity Sheet</h2>

      {/* Year Selector */}
      <div className="flex justify-center mb-4">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          {years.map((year) => (
            <option key={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Attendance Table */}
      <div className="overflow-auto">
        <table className="table-auto border border-gray-300 w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Month</th>
              {/* Generate 31 day headers */}
              {Array.from({ length: maxDays }, (_, i) => (
                <th key={i + 1} className="border px-2 py-1 text-center">{i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {months.map((month) => {
              // Calculate days in the current month and selected year
              const daysInMonth = new Date(Number(selectedYear), months.indexOf(month) + 1, 0).getDate();

              // Safely access attendance data, defaulting to an empty array if not found
              const attendanceDays =
                memberData?.attendance?.[selectedYear]?.[month] || [];

              return (
                <tr key={month}>
                  <td className="border px-2 py-1 font-medium">{month}</td>
                  {/* Iterate up to maxDays for consistent columns */}
                  {Array.from({ length: maxDays }, (_, i) => (
                    <td key={i + 1} className="border px-2 py-1 text-center">
                      {/* Only display checkmark if day exists in month AND is in attendance */}
                      {i + 1 <= daysInMonth && attendanceDays.includes(i + 1)
                        ? "✔️"
                        : ""}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Activity;