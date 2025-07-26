import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, updateDoc, setDoc } from "firebase/firestore";

const Managemember = () => {
  const [members, setMembers] = useState([]);
  const [selectedTab, setSelectedTab] = useState("add");
  const [selectedRollNo, setSelectedRollNo] = useState("");
  const [memberData, setMemberData] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("allMembers");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMembers(parsed);
      } catch (err) {
        console.error("Invalid sessionStorage data for allMembers.", err);
      }
    }
  }, []);

  const getMaxRollNo = () => {
    const rollNos = members.map((m) => m.roll_no || 0);
    return Math.max(...rollNos, 0);
  };

  const handleRollChange = (rollNo) => {
    setSelectedRollNo(rollNo);
    setMessage("");

    const isNew = String(rollNo) === String(getMaxRollNo() + 1);
    if (isNew) {
      // Blank for new roll number
      setMemberData({
        name: "",
        last_name: "",
        email: "",
        phone_no: "",
        address: "",
        roll_no: rollNo,
      });
    } else {
      // Load from existing
      const member = members.find((m) => String(m.roll_no) === String(rollNo));
      if (member) {
        setMemberData({ ...member });
      }
    }
  };

  const handleInputChange = (field, value) => {
    setMemberData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!memberData?.roll_no) return;

    try {
      const id = memberData.id || memberData.roll_no.toString();
      const ref = doc(db, "members", id);
      const dataToSave = {
        ...memberData,
        id: id,
        roll_no: memberData.roll_no,
      };

      await setDoc(ref, dataToSave, { merge: true });

      setMessage("✅ Member saved successfully.");
    } catch (err) {
      console.error("Save error:", err);
      setMessage("❌ Error saving member.");
    }
  };

  const handleDelete = async () => {
    if (!selectedRollNo) return;

    const member = members.find((m) => String(m.roll_no) === String(selectedRollNo));
    if (!member || !member.id) {
      setMessage("❌ Member not found.");
      return;
    }

    try {
      const ref = doc(db, "members", member.id);
      const fieldsToDelete = {
        name: "",
        last_name: "",
        email: "",
        phone_no: "",
        address: "",
        attendance: {},
        donation: {},
        approved: false,
        isAdmin: false,
        isSuperAdmin: false,
        password: "",
        img: "",
      };
      await updateDoc(ref, fieldsToDelete);
      setMessage("🗑️ Member details deleted (roll number retained).");
    } catch (err) {
      console.error("Delete error:", err);
      setMessage("❌ Error deleting member.");
    }
  };

  const maxRoll = getMaxRollNo();
  const addTabRolls = [...members.map((m) => m.roll_no), maxRoll + 1];
  const deleteTabRolls = members.map((m) => m.roll_no);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-center mb-4">
        <button
          onClick={() => {
            setSelectedTab("add");
            setSelectedRollNo("");
            setMemberData(null);
            setMessage("");
          }}
          className={`px-4 py-2 rounded-l ${selectedTab === "add" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
        >
          Add Member
        </button>
        <button
          onClick={() => {
            setSelectedTab("delete");
            setSelectedRollNo("");
            setMemberData(null);
            setMessage("");
          }}
          className={`px-4 py-2 rounded-r ${selectedTab === "delete" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
        >
          Delete Member
        </button>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Select Roll Number</label>
        <select
          value={selectedRollNo}
          onChange={(e) => handleRollChange(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">-- Select --</option>
          {(selectedTab === "add" ? addTabRolls : deleteTabRolls).sort((a, b) => a - b).map((roll) => (
            <option key={roll} value={roll}>
              {roll}
            </option>
          ))}
        </select>
      </div>

      {memberData && (
        <div className="grid gap-3">
          <div>
            <label className="block text-sm">First Name</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={memberData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              readOnly={selectedTab === "add" && String(selectedRollNo) <= maxRoll}
            />
          </div>

          <div>
            <label className="block text-sm">Last Name</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={memberData.last_name || ""}
              onChange={(e) => handleInputChange("last_name", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm">Email</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={memberData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm">Phone</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={memberData.phone_no || ""}
              onChange={(e) => handleInputChange("phone_no", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm">Address</label>
            <textarea
              className="w-full border px-3 py-2 rounded"
              rows="2"
              value={memberData.address || ""}
              onChange={(e) => handleInputChange("address", e.target.value)}
            ></textarea>
          </div>

          {selectedTab === "add" && (
            <button
              onClick={handleSave}
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save Member
            </button>
          )}

          {selectedTab === "delete" && (
            <button
              onClick={handleDelete}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete Member Details
            </button>
          )}

          {message && (
            <p className={`text-sm mt-2 ${message.includes("✅") || message.includes("🗑️") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Managemember;
