import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);

      // Check if user is still in 'users' collection (pending approval)
      const pendingSnap = await getDoc(doc(db, "users", res.user.uid));
      if (pendingSnap.exists()) {
        alert("❌ Account not approved by admin yet.");
        await signOut(auth);
        return;
      }

      // Fetch all members from 'members' collection
      const membersRef = collection(db, "members");
      const snapshot = await getDocs(membersRef);
      let approvedMember = null;
      const allMembers = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const memberObj = { id: docSnap.id, ...data };
        allMembers.push(memberObj);

        if (data.email === email && data.password === password) {
          approvedMember = memberObj;
        }
      });

      if (!approvedMember) {
        alert("❌ Approved member not found.");
        await signOut(auth);
        return;
      }

      // ✅ Fetch expenses document and save to sessionStorage
      const expenseDocRef = doc(db, "expenses", "hPTZ3pkljqT2yuiKLDA3");
      const expenseDocSnap = await getDoc(expenseDocRef);

      if (expenseDocSnap.exists()) {
        const expensesData = expenseDocSnap.data();
        sessionStorage.setItem("expenses", JSON.stringify(expensesData));
      } else {
        console.warn("⚠️ No expenses data found.");
        sessionStorage.setItem("expenses", JSON.stringify({}));
      }

      // Save member & members list
      localStorage.setItem("loggedInMember", JSON.stringify(approvedMember));
      sessionStorage.setItem("allMembers", JSON.stringify(allMembers));

      alert("✅ Login successful!");
      navigate("/home", { replace: true });
    } catch (err) {
      alert("Login error: " + err.message);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="max-w-md mx-auto p-6 bg-white shadow rounded space-y-4"
    >
      <h2 className="text-xl font-bold text-center">Login</h2>
      <input
        className="w-full border p-2 rounded"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        className="w-full border p-2 rounded"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition"
      >
        Login
      </button>
      <p className="text-sm text-center">
        Don’t have an account?{" "}
        <a href="/signup" className="text-blue-600 underline">
          Signup
        </a>
      </p>
    </form>
  );
}

export default Login;
