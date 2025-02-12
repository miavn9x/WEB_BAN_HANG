import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const PrivateRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");

  // Nếu không có token, chuyển hướng đến trang đăng nhập
  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    // Giải mã token để lấy thông tin user
    const decodedToken = jwtDecode(token);

    // Kiểm tra nếu token đã hết hạn
    if (decodedToken.exp * 1000 < Date.now()) {
      localStorage.clear();
      return <Navigate to="/login" />;
    }

    // Kiểm tra phân quyền nếu có yêu cầu role
    if (requiredRole && decodedToken.role !== requiredRole) {
      return <Navigate to="/Error403" />;
    }

    return children;
  } catch (error) {
    console.error("Lỗi xác thực token:", error);
    localStorage.clear();
    return <Navigate to="/login" />;
  }
};

export default PrivateRoute;
