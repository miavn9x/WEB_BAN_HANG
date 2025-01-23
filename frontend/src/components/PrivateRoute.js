import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; 

const PrivateRoute = ({ isAuthenticated, requiredRole, children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.role;

    if (isAuthenticated && userRole !== requiredRole) {
      return <Navigate to="/Error403" replace />;
    }
  } catch (error) {
    console.error("Token không hợp lệ:", error);
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
