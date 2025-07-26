import { useEffect, useState, useMemo } from "react";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const years = Array.from({ length: 11 }, (_, i) => String(2025 + i)); // Store as strings for consistency with select value

const MAX_DAYS_IN_MONTH = 31; // Constant for consistent table headers

const Activity = () => {
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear())); // Default to current year or "2025"
  const [memberAttendance, setMemberAttendance] = useState(null); // Rename to reflect its content better

  // Use useEffect to read from localStorage only once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("loggedInMember");
      if (stored) {
        const parsedData = JSON.parse(stored);
        // We're only interested in the attendance data for this component
        setMemberAttendance(parsedData.attendance || {});
      }
    } catch (error) {
      console.error("Error parsing member data from localStorage:", error);
      setMemberAttendance({}); // Fallback to empty object on error
    }
  }, []);

  // Memoize the attendance data for the selected year to prevent re-calculations
  // unless selectedYear or memberAttendance changes.
  const currentYearAttendance = useMemo(() => {
    return memberAttendance?.[selectedYear] || {};
  }, [memberAttendance, selectedYear]);

  return (
    <div className="p-4 overflow-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Your Activity Sheet</h2>

      {/* Year Selector */}
      <div className="flex justify-center mb-4">
        <label htmlFor="year-select" className="sr-only">Select Year</label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Attendance Table */}
      <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                Month
              </th>
              {Array.from({ length: MAX_DAYS_IN_MONTH }, (_, i) => (
                <th
                  key={i + 1}
                  scope="col"
                  className="px-2 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {memberAttendance === null ? (
              <tr>
                <td colSpan={MAX_DAYS_IN_MONTH + 1} className="text-center py-4 text-gray-500">
                  Loading activity data...
                </td>
              </tr>
            ) : (
              months.map((month) => {
                const monthIndex = months.indexOf(month);
                // Calculate actual days in the current month/year for accurate rendering
                const daysInMonth = new Date(Number(selectedYear), monthIndex + 1, 0).getDate();

                // Get attendance days for the specific month
                const attendanceForMonth = currentYearAttendance[month] || [];

                return (
                  <tr key={month}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                      {month}
                    </td>
                    {Array.from({ length: MAX_DAYS_IN_MONTH }, (_, i) => {
                      const dayNumber = i + 1;
                      const isAttended = attendanceForMonth.includes(dayNumber);
                      const isDayInMonth = dayNumber <= daysInMonth;

                      return (
                        <td
                          key={dayNumber}
                          className={`px-2 py-2 whitespace-nowrap text-center text-sm ${
                            isDayInMonth && isAttended
                              ? "text-green-600 font-bold"
                              : "text-gray-400"
                          }`}
                        >
                          {isDayInMonth && isAttended ? "✔" : ""}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Message if no data is found */}
      {memberAttendance && Object.keys(memberAttendance).length === 0 && (
        <p className="text-center text-gray-500 mt-6">
          No activity data found. Please ensure you are logged in correctly.
        </p>
      )}
      {memberAttendance && Object.keys(currentYearAttendance).length === 0 && (
        <p className="text-center text-gray-500 mt-2">
          No activity recorded for {selectedYear}.
        </p>
      )}
    </div>
  );
};

export default Activity;