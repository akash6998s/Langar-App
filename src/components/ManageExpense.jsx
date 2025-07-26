import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const years = ["2024", "2025"];
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function ManageExpense() {
  const [mode, setMode] = useState("add");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedMonth, setSelectedMonth] = useState("July");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    fetchExpenses();
  }, [selectedYear, selectedMonth]);

  const fetchExpenses = async () => {
    const snapshot = await getDocs(collection(db, "expenses"));
    const data = [];

    snapshot.forEach((docSnap) => {
      const expense = docSnap.data();
      if (
        expense[selectedYear] &&
        expense[selectedYear][selectedMonth]
      ) {
        expense[selectedYear][selectedMonth].forEach((e) => {
          data.push({ ...e, docId: docSnap.id });
        });
      }
    });

    setExpenses(data);
  };

  const handleAddExpense = async () => {
    if (!amount || !description) {
      alert("Please fill all fields");
      return;
    }

    const snapshot = await getDocs(collection(db, "expenses"));
    let docRef = null;

    if (snapshot.empty) {
      const newDocRef = doc(collection(db, "expenses"));
      await setDoc(newDocRef, {
        [selectedYear]: {
          [selectedMonth]: [
            {
              amount: parseFloat(amount),
              description,
              id: uuidv4(),
            },
          ],
        },
      });
    } else {
      const firstDoc = snapshot.docs[0];
      docRef = doc(db, "expenses", firstDoc.id);
      const docData = firstDoc.data();

      const existing = docData[selectedYear]?.[selectedMonth] || [];
      const updated = [
        ...existing,
        {
          amount: parseFloat(amount),
          description,
          id: uuidv4(),
        },
      ];

      await updateDoc(docRef, {
        [`${selectedYear}.${selectedMonth}`]: updated,
      });
    }

    setAmount("");
    setDescription("");
    fetchExpenses();
  };

  const handleDeleteExpense = async (idToDelete) => {
    const snapshot = await getDocs(collection(db, "expenses"));
    if (snapshot.empty) return;

    const firstDoc = snapshot.docs[0];
    const docRef = doc(db, "expenses", firstDoc.id);
    const docData = firstDoc.data();

    const currentExpenses = docData[selectedYear]?.[selectedMonth] || [];

    const updatedExpenses = currentExpenses.filter(
      (e) => e.id !== idToDelete
    );

    await updateDoc(docRef, {
      [`${selectedYear}.${selectedMonth}`]: updatedExpenses,
    });

    fetchExpenses();
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Manage Expense</h2>

      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setMode("add")}
          className={`px-4 py-2 rounded ${mode === "add" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Add Expense
        </button>
        <button
          onClick={() => setMode("delete")}
          className={`px-4 py-2 rounded ${mode === "delete" ? "bg-red-500 text-white" : "bg-gray-200"}`}
        >
          Delete Expense
        </button>
      </div>

      <div className="mb-4 flex space-x-4">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border p-2 rounded"
        >
          {years.map((year) => (
            <option key={year}>{year}</option>
          ))}
        </select>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border p-2 rounded"
        >
          {months.map((month) => (
            <option key={month}>{month}</option>
          ))}
        </select>
      </div>

      {mode === "add" && (
        <div>
          <input
            type="number"
            placeholder="Amount"
            className="border p-2 w-full mb-2 rounded"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            type="text"
            placeholder="Description"
            className="border p-2 w-full mb-2 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            onClick={handleAddExpense}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Save Expense
          </button>
        </div>
      )}

      {mode === "delete" && (
        <div className="mt-4">
          {expenses.length === 0 ? (
            <p>No expenses found.</p>
          ) : (
            <ul className="space-y-2">
              {expenses.map((exp) => (
                <li
                  key={exp.id}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <div>
                    <p className="font-medium">₹{exp.amount}</p>
                    <p className="text-sm text-gray-600">{exp.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteExpense(exp.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
