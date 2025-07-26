import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

// Components
import Header from "./components/Header";
import Home from "./pages/Home";
import Activity from "./components/Activity";
import Members from "./components/Members";
import Profile from "./components/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminPanel from "./pages/AdminPanel";
import UploadAllData from "./components/UploadAllData";

function ProtectedRoute({ user, isApproved, children }) {
  if (!user || !isApproved) {
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currUser) => {
      if (currUser) {
        const membersRef = collection(db, "members");
        const snapshot = await getDocs(membersRef);

        let found = false;
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (
            data.email === currUser.email &&
            data.password && // ensure password is present
            data.approved === true
          ) {
            found = true;
            // Save to localStorage for later use
            localStorage.setItem("loggedInMember", JSON.stringify(data));
          }
        });

        setUser(currUser);
        setIsApproved(found);
      } else {
        setUser(null);
        setIsApproved(false);
        localStorage.removeItem("loggedInMember");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="text-center mt-20 text-xl font-semibold">Loading...</div>;
  }

  return (
    <Router>
      {user && isApproved && <Header />}
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute user={user} isApproved={isApproved}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity"
          element={
            <ProtectedRoute user={user} isApproved={isApproved}>
              <Activity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/members"
          element={
            <ProtectedRoute user={user} isApproved={isApproved}>
              <Members />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user} isApproved={isApproved}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/stthbudsujdsuj" element={<UploadAllData />} />
      </Routes>
    </Router>
  );
}

export default App;
