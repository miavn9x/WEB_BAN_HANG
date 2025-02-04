// AutoLogout.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AutoLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return; // Nếu không có token thì không cần theo dõi

    try {
      const decoded = jwtDecode(token);
      // Tính thời gian còn lại (ms) trước khi token hết hạn
      const expirationTime = decoded.exp * 1000 - Date.now();
      console.log("Thời gian còn lại (ms):", expirationTime);

      if (expirationTime <= 0) {
        // Nếu token đã hết hạn, xóa token và chuyển hướng
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userRole");
        navigate("/login");
      } else {
        // Tạo timer đăng xuất khi hết thời gian
        const timer = setTimeout(() => {
          console.log("Token hết hạn, đăng xuất tự động");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("userRole");
          navigate("/login");
        }, expirationTime);

        // Xóa timer khi component unmount
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error("Lỗi khi decode token:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      navigate("/login");
    }
  }, [navigate]);

  return null;
};

export default AutoLogout;
