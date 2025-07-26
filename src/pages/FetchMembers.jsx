import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Adjust path as needed

const FetchMembers = () => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const memberCollection = collection(db, "members");
        const snapshot = await getDocs(memberCollection);
        const data = snapshot.docs.map((doc) => doc.data());
        setMembers(data);
        console.log("✅ Members fetched:", data);
      } catch (error) {
        console.error("❌ Error fetching members:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center">👥 All Members</h2>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => (
          <div
            key={member.roll_no}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
          >
            <div className="flex items-center gap-4 mb-3">
              <img
                src={`/images/${member.img || "default.png"}`} // adjust image path
                alt={member.name}
                className="w-16 h-16 rounded-full border"
              />
              <div>
                <h3 className="text-lg font-semibold">
                  {member.name} {member.last_name}
                </h3>
                <p className="text-sm text-gray-500">Roll No: {member.roll_no}</p>
                <p className="text-sm text-gray-500">📞 {member.phone_no}</p>
                <p className="text-sm text-gray-500">🏠 {member.address}</p>
              </div>
            </div>

            {/* Donation Section */}
            <div className="mt-4">
              <h4 className="text-md font-semibold mb-1 text-blue-700">💰 Donations</h4>
              {member.donation && member.donation["2025"] ? (
                <ul className="text-sm space-y-1">
                  {Object.entries(member.donation["2025"]).map(([month, amount]) => (
                    <li key={month}>
                      <span className="font-medium">{month}:</span> ₹{amount}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No donations recorded.</p>
              )}
            </div>

            {/* Attendance Section */}
            <div className="mt-4">
              <h4 className="text-md font-semibold mb-1 text-green-700">✅ Attendance</h4>
              {member.attendance ? (
                <ul className="text-sm space-y-1">
                  {Object.entries(member.attendance).map(([month, days]) => (
                    <li key={month}>
                      <span className="font-medium">{month}:</span>{" "}
                      {days.length > 0 ? days.join(", ") : "—"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No attendance found.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FetchMembers;
