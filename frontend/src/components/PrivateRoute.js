import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const PrivateRoute = ({ children, requiredRoles }) => {
  const token = localStorage.getItem("token");

  // Nếu không có token, chuyển hướng đến trang đăng nhập
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    // Giải mã token để lấy thông tin người dùng
    const decodedToken = jwtDecode(token);

    // Nếu token đã hết hạn, xóa localStorage và chuyển hướng về trang đăng nhập
    if (decodedToken.exp * 1000 < Date.now()) {
      localStorage.clear();
      return <Navigate to="/login" replace />;
    }

    // Nếu có yêu cầu phân quyền, kiểm tra xem role của người dùng có nằm trong danh sách cho phép không
    if (requiredRoles && !requiredRoles.includes(decodedToken.role)) {
      return <Navigate to="/Error403" replace />;
    }

    return children;
  } catch (error) {
    console.error("Lỗi xác thực token:", error);
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;
