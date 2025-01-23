// import React from "react";
// import { Navigate } from "react-router-dom";

// const PrivateRoute = ({ children, allowedRoles }) => {
//   const token = localStorage.getItem("token");
//   const user = JSON.parse(localStorage.getItem("user"));

//   // Nếu chưa đăng nhập
//   if (!token || !user) {
//     return <Navigate to="/login" />;
//   }

//   // Nếu user không có quyền truy cập
//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     return <Navigate to="/forbidden" />;
//   }

//   // Nếu hợp lệ
//   return children;
// };

// export default PrivateRoute;
