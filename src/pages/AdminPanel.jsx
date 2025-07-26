// src/pages/AdminPanel.jsx
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const approveUser = async (user) => {
    if (!user.roll_no || !user.email || !user.password) {
      alert("❌ Missing email, password, or roll number in user data.");
      return;
    }

    const rollNo = user.roll_no.toString();
    const memberRef = doc(db, "members", rollNo);
    const memberSnap = await getDoc(memberRef);

    if (!memberSnap.exists()) {
      alert(`❌ Member with roll number ${rollNo} not found.`);
      return;
    }

    const memberData = memberSnap.data();

    await setDoc(memberRef, {
      ...memberData,
      email: user.email,
      password: user.password, // plain text
      approved: true,
    });

    await deleteDoc(doc(db, "users", user.id));
    alert(`✅ Approved user with roll no ${rollNo}`);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Admin Approval Panel</h2>
      <ul className="space-y-4">
        {users.map((user) => (
          <li key={user.id} className="border p-4 rounded">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Roll No:</strong> {user.roll_no}
            </p>
            <button
              onClick={() => approveUser(user)}
              className="bg-green-600 text-white px-4 py-1 mt-2 rounded"
            >
              Approve
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;
