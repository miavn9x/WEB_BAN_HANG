import React from "react";
import { Navigate } from "react-router-dom";

// PrivateRoute component: Bảo vệ các route yêu cầu đăng nhập và quyền truy cập
const PrivateRoute = ({ isAuthenticated, requiredRole, children }) => {
  // Nếu chưa đăng nhập, chuyển hướng tới trang đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có yêu cầu quyền truy cập và người dùng không có quyền, chuyển hướng tới trang lỗi 403
  if (requiredRole && requiredRole !== "admin") {
    return <Navigate to="/Error403" replace />;
  }

  // Nếu người dùng đã đăng nhập và có quyền truy cập, hiển thị nội dung trang cần bảo vệ
  return children;
};

export default PrivateRoute;
