import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

const ProtectedRoute = ({ children, role }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMe = async () => {
      try {
    console.log("GETTING ME...");

    const response = await api.get("/api/auth/me");

    console.log("GET ME SUCCESS:", response.status);
    console.log("GET ME USER:", response.data);

    setUser(response.data);
} catch (err) {
    console.log("GET ME ERROR:", err);
    console.log("STATUS:", err.response?.status);
    console.log("DATA:", err.response?.data);
    console.log("URL:", err.config?.url);

    setUser(null);
} finally {
    setLoading(false);
}
    };

    getMe();
  }, []);

  if (loading) {
    return <h1>Loading</h1>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;