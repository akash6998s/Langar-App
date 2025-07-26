import React from "react";
import members from "../data/members.json";
import attendanceRaw from "../data/attendance.json";
import donationsRaw from "../data/donations.json";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

// ✅ Utility
const monthList = [
  "january", "february", "March", "April", "May",
  "June", "July", "August", "September", "October", "November", "December"
];

// ✅ Fix: Handle deeply nested attendance structure
const buildAttendanceMap = () => {
  const map = {};

  attendanceRaw.forEach((yearData) => {
    const year = Object.keys(yearData)[0];
    const months = yearData[year];

    Object.entries(months).forEach(([month, days]) => {
      Object.entries(days).forEach(([day, rollMap]) => {
        Object.keys(rollMap).forEach((rollStr) => {
          const roll = parseInt(rollStr);
          if (!map[roll]) {
            map[roll] = {};
            monthList.forEach(m => (map[roll][m] = []));
          }

          // Ensure the day gets pushed into the right month (case-insensitive match)
          const cleanMonth = monthList.find(m => m.toLowerCase() === month.toLowerCase());
          if (cleanMonth && !map[roll][cleanMonth].includes(parseInt(day))) {
            map[roll][cleanMonth].push(parseInt(day));
          }
        });
      });
    });
  });

  return map;
};

// ✅ Build donation map
const buildDonationMap = () => {
  const map = {};
  const year = "2025";

  if (!donationsRaw[year]) return map;

  Object.entries(donationsRaw[year]).forEach(([month, data]) => {
    Object.entries(data).forEach(([rollStr, amount]) => {
      const roll = parseInt(rollStr);
      if (!map[roll]) map[roll] = { [year]: {} };
      map[roll][year][month] = amount;
    });
  });

  return map;
};

const backupfiles = () => {
  const handleUpload = async () => {
    const attendanceMap = buildAttendanceMap();
    const donationMap = buildDonationMap();

    for (const member of members) {
      const roll_no = parseInt(member.roll_no);
      const finalData = {
        ...member,
        roll_no,
        attendance:
          attendanceMap[roll_no] ||
          monthList.reduce((acc, m) => {
            acc[m] = [];
            return acc;
          }, {}),
        donation: donationMap[roll_no] || {}
      };

      try {
        await setDoc(doc(db, "members", roll_no.toString()), finalData);
        console.log(`✅ Uploaded roll_no ${roll_no}`);
      } catch (error) {
        console.error(`❌ Error uploading roll_no ${roll_no}:`, error);
      }
    }

    alert("✅ All members uploaded to Firebase in the desired structure!");
  };

  return (
    <div className="p-4">
      <button
        onClick={handleUpload}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        Upload All Member Data to Firebase
      </button>
    </div>
  );
};

export default backupfiles;
