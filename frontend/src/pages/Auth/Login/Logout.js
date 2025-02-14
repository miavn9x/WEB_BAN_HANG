// // Logout.js
// import { useNavigate, useLocation } from "react-router-dom";

// const Logout = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     localStorage.removeItem("userRole");

//     const previousPage = location.state?.from || "/login";
//     navigate(previousPage);
//   };

//   return (
//     <button
//       onClick={handleLogout}
//       className="btn btn-outline-danger"
//       style={{ border: "none" }}
//     >
//       Đăng xuất
//     </button>
//   );
// };

// export default Logout;
