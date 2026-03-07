import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

function RotaAdmin({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/admin-login" />;
}

export default RotaAdmin;