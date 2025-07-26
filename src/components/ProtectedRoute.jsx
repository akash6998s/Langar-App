import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ user, isApproved, children }) => {
  if (!user) return <Navigate to="/login" />;
  if (!isApproved) return <Navigate to="/login" />;
  return children;
};

export default ProtectedRoute;
