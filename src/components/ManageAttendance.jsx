import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

export default function ManageAttendance() {
  const [activeTab, setActiveTab] = useState("add");
  const [members, setMembers] = useState([]);
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("July");
  const [day, setDay] = useState("1");
  const [selectedRolls, setSelectedRolls] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    const fetchMembers = async () => {
      const querySnapshot = await getDocs(collection(db, "members"));
      const memberList = [];
      querySnapshot.forEach((doc) => {
        memberList.push({ id: doc.id, ...doc.data() });
      });
      setMembers(memberList);
    };
    fetchMembers();
  }, []);

  const toggleRoll = (roll) => {
    setSelectedRolls((prev) =>
      prev.includes(roll) ? prev.filter((r) => r !== roll) : [...prev, roll]
    );
  };

  const handleSubmit = async () => {
    const dayNumber = Number(day);

    for (let roll of selectedRolls) {
      const memberRef = doc(db, "members", roll);
      const memberSnap = await getDoc(memberRef);
      const data = memberSnap.data();
      const attendance = data?.attendance || {};
      const existingDays = attendance?.[year]?.[month] || [];

      if (!existingDays.includes(dayNumber)) {
        const newAttendance = {
          ...attendance,
          [year]: {
            ...(attendance[year] || {}),
            [month]: [...existingDays, dayNumber]
          }
        };
        await updateDoc(memberRef, { attendance: newAttendance });
      }
    }

    alert("Attendance submitted! (Duplicates skipped)");
    setSelectedRolls([]);
  };

  const handleDelete = async () => {
    const dayNumber = Number(day);

    for (let roll of selectedRolls) {
      const memberRef = doc(db, "members", roll);
      const memberSnap = await getDoc(memberRef);
      const data = memberSnap.data();
      const attendance = data?.attendance || {};

      if (attendance[year] && attendance[year][month]) {
        const updatedMonth = attendance[year][month].filter((d) => d !== dayNumber);

        if (updatedMonth.length > 0) {
          attendance[year][month] = updatedMonth;
        } else {
          delete attendance[year][month];
        }

        if (Object.keys(attendance[year]).length === 0) {
          delete attendance[year];
        }

        await updateDoc(memberRef, { attendance });
      }
    }

    alert("Attendance deleted!");
    setSelectedRolls([]);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setActiveTab("add")}
          className={`px-4 py-2 mr-2 rounded ${activeTab === "add" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Add Attendance
        </button>
        <button
          onClick={() => setActiveTab("delete")}
          className={`px-4 py-2 rounded ${activeTab === "delete" ? "bg-red-600 text-white" : "bg-gray-200"}`}
        >
          Delete Attendance
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <select className="p-2 border" value={year} onChange={(e) => setYear(e.target.value)}>
          <option>2024</option>
          <option>2025</option>
        </select>
        <select className="p-2 border" value={month} onChange={(e) => setMonth(e.target.value)}>
          {months.map((m) => <option key={m}>{m}</option>)}
        </select>
        <select className="p-2 border" value={day} onChange={(e) => setDay(e.target.value)}>
          {[...Array(31).keys()].map((d) => (
            <option key={d + 1} value={d + 1}>{d + 1}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col space-y-4">
        <button
          className="w-full py-2 bg-gray-800 text-white rounded"
          onClick={() => setShowPopup(true)}
        >
          Select Roll Numbers
        </button>

        <button
          className={`w-full py-2 text-white rounded ${activeTab === "add" ? "bg-blue-600" : "bg-red-600"}`}
          onClick={activeTab === "add" ? handleSubmit : handleDelete}
        >
          {activeTab === "add" ? "Submit Attendance" : "Delete Attendance"}
        </button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded max-h-[80vh] w-[90%] md:w-[400px] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              Select Roll Numbers
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {members.map((member) => (
                <label key={member.id} className="text-sm">
                  <input
                    type="checkbox"
                    checked={selectedRolls.includes(member.id)}
                    onChange={() => toggleRoll(member.id)}
                    className="mr-2"
                  />
                  {member.id}
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
