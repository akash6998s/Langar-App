import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [rollOptions, setRollOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRollNumbers = async () => {
      const snap = await getDocs(collection(db, "members"));
      const rolls = snap.docs.map((doc) => doc.id);
      setRollOptions(rolls);
    };
    fetchRollNumbers();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!rollNo) {
      alert("❗Please select a roll number.");
      return;
    }

    try {
      // ✅ Step 1: Check if email or roll number already in 'users' collection
      const usersSnapshot = await getDocs(collection(db, "users"));
      const emailExists = usersSnapshot.docs.some(
        (doc) => doc.data().email === email
      );
      const rollUsed = usersSnapshot.docs.some(
        (doc) => doc.data().roll_no === rollNo
      );

      if (emailExists) {
        alert("❌ This email is already registered and awaiting approval.");
        return;
      }

      if (rollUsed) {
        alert("❌ This roll number is already registered and awaiting approval.");
        return;
      }

      // ✅ Step 2: Try creating new Firebase Auth user
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      } catch (err) {
        // If email already in Firebase Auth, try signing in to get UID
        if (err.code === "auth/email-already-in-use") {
          userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );
        } else {
          throw err;
        }
      }

      // ✅ Step 3: Save to 'users' collection with user's UID
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        password,
        roll_no: rollNo,
        approved: false,
        createdAt: new Date(),
      });

      alert("✅ Signup successful. Please wait for admin approval.");
      navigate("/");
    } catch (err) {
      alert("Signup error: " + err.message);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Signup</h2>
      <form onSubmit={handleSignup} className="space-y-4">
        <input
          className="w-full p-2 border rounded"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          className="w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <select
          className="w-full p-2 border rounded"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
          required
        >
          <option value="">Select Roll No</option>
          {rollOptions.map((roll) => (
            <option key={roll} value={roll}>
              {roll}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Signup
        </button>
      </form>
    </div>
  );
}

export default Signup;
