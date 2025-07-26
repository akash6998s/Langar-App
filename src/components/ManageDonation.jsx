import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

function ManageDonation() {
  const [activeTab, setActiveTab] = useState("add");
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("July");
  const [amount, setAmount] = useState("");
  const [rollNumbers, setRollNumbers] = useState([]);
  const [selectedRoll, setSelectedRoll] = useState(null);

  useEffect(() => {
    const fetchRolls = async () => {
      const querySnapshot = await getDocs(collection(db, "members"));
      const rolls = [];
      querySnapshot.forEach((doc) => {
        rolls.push(doc.id);
      });
      setRollNumbers(rolls);
    };

    fetchRolls();
  }, []);

  const handleDonation = async () => {
    if (!selectedRoll || !year || !month || amount === "" || isNaN(parseInt(amount))) {
      alert("Please fill all fields with a valid amount.");
      return;
    }

    const memberRef = doc(db, "members", selectedRoll);
    const memberSnap = await getDoc(memberRef);

    if (!memberSnap.exists()) {
      alert("Member not found.");
      return;
    }

    const data = memberSnap.data();
    const existingDonation = data.donation || {};
    const updatedDonation = { ...existingDonation };
    const donationAmount = parseInt(amount);

    if (!updatedDonation[year]) {
      updatedDonation[year] = {};
    }

    // Get the current amount for the selected month, default to 0 if not exists
    const currentMonthAmount = updatedDonation[year][month] || 0;

    // Add the new amount to the existing one
    updatedDonation[year][month] = currentMonthAmount + donationAmount;

    await updateDoc(memberRef, {
      donation: updatedDonation,
    });

    alert("Donation added successfully.");
    setAmount("");
    setSelectedRoll(null);
  };

  const handleDeleteDonation = async () => {
    if (!selectedRoll || !year || !month || amount === "" || isNaN(parseInt(amount))) {
      alert("Please fill all fields with a valid amount to delete.");
      return;
    }

    const memberRef = doc(db, "members", selectedRoll);
    const memberSnap = await getDoc(memberRef);

    if (!memberSnap.exists()) {
      alert("Member not found.");
      return;
    }

    const data = memberSnap.data();
    const existingDonation = data.donation || {};
    const updatedDonation = { ...existingDonation };
    const amountToDelete = parseInt(amount);

    if (
      updatedDonation[year] &&
      updatedDonation[year][month] !== undefined
    ) {
      const currentMonthAmount = updatedDonation[year][month];

      // Subtract the amount, ensuring it doesn't go below zero
      updatedDonation[year][month] = Math.max(0, currentMonthAmount - amountToDelete);

      // If the amount becomes 0, consider removing the month entry
      if (updatedDonation[year][month] === 0) {
        delete updatedDonation[year][month];
        // If the year object becomes empty, remove the year too
        if (Object.keys(updatedDonation[year]).length === 0) {
          delete updatedDonation[year];
        }
      }

      await updateDoc(memberRef, {
        donation: updatedDonation,
      });

      alert("Donation updated successfully.");
      setSelectedRoll(null);
      setAmount(""); // Clear the amount after deletion
    } else {
      alert("No donation found for the selected date to subtract from.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("add")}
          className={`px-4 py-2 rounded ${
            activeTab === "add" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Add Donation
        </button>
        <button
          onClick={() => setActiveTab("delete")}
          className={`px-4 py-2 rounded ${
            activeTab === "delete" ? "bg-red-500 text-white" : "bg-gray-200"
          }`}
        >
          Delete Donation
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mr-2">Select Year:</label>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="border p-2">
            <option>2024</option>
            <option>2025</option>
          </select>
        </div>

        <div>
          <label className="mr-2">Select Month:</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="border p-2">
            {[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map((mon) => (
              <option key={mon}>{mon}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mr-2">Enter Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2"
          />
        </div>

        <div>
          <Popup
            trigger={
              <button className="bg-green-500 text-white px-4 py-2 rounded">
                Select Roll Number
              </button>
            }
            modal
            nested
          >
            {(close) => (
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Select Roll Number</h3>
                <ul className="space-y-2">
                  {rollNumbers.map((roll) => (
                    <li key={roll}>
                      <button
                        className={`px-4 py-2 border rounded ${
                          selectedRoll === roll ? "bg-blue-500 text-white" : ""
                        }`}
                        onClick={() => {
                          setSelectedRoll(roll);
                          close();
                        }}
                      >
                        {roll}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Popup>
        </div>

        {activeTab === "add" && (
          <button
            onClick={handleDonation}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Add Donation
          </button>
        )}

        {activeTab === "delete" && (
          <button
            onClick={handleDeleteDonation}
            className="bg-red-600 text-white px-6 py-2 rounded"
          >
            Delete Donation
          </button>
        )}
      </div>
    </div>
  );
}

export default ManageDonation;