import React, { useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Lưu ý: jwt-decode xuất theo kiểu default
import "../../../styles/LoginMenu.css";
import { logoutUser } from "../../../redux/actions/authActions"; // Thêm import
// In LoginMenu.js
import { useDispatch } from "react-redux";
// Other imports...

const LoginMenu = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState("");
  const dispatch = useDispatch(); // Thêm hook dispatch

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);

      // Kiểm tra xem token có hết hạn không
      if (decodedToken.exp * 1000 < Date.now()) {
        // Nếu token hết hạn, chỉ xóa token và giỏ hàng (không xóa toàn bộ dữ liệu)
        localStorage.removeItem("token");
        localStorage.removeItem("cart");
        navigate("/login");
        return;
      }

      setUserRole(decodedToken.role);
    } catch (error) {
      console.error("Lỗi giải mã token:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("cart");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    // Chỉ xóa token và giỏ hàng khỏi localStorage, không xóa toàn bộ dữ liệu
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
    dispatch(logoutUser());
    navigate(location.state?.from || "/");
  };

  return (
    <div className="Menulogin__dropdown">
      <Dropdown.Menu className="login__menu" renderMenuOnMount>
        <button className="close-button d-lg-block d-lg-none" onClick={onClose}>
          ✖
        </button>
        {userRole === "admin" ? (
          <>
            <Dropdown.Item onClick={() => navigate("/thong-tin-ca-nhan")}>
              Thông tin tài khoản
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate("/order-history/:orderId")}>
              Lịch sử mua hàng
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate("/gio-hang")}>
              Giỏ hàng
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => navigate("/admin/order_Dashboard")}>
              Theo dõi đơn &hàng
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate("/admin/user-management")}>
              Quản lý user
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate("/admin/add-product")}>
              Đăng sản phẩm
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate("/admin/add-bai-viet")}>
              Tạo bài viết
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate("/admin/posts-management")}>
              Quản lý bài viết
            </Dropdown.Item>
          </>
        ) : (
          <>
            <Dropdown.Item onClick={() => navigate("/thong-tin-ca-nhan")}>
              Thông tin tài khoản
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate("/order-history/:orderId")}>
              Lịch sử mua hàng
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate("/gio-hang")}>
              Giỏ hàng
            </Dropdown.Item>
          </>
        )}
        <Dropdown.Divider />
        <div
          className="menu-item"
          onClick={handleLogout}
          style={{
            backgroundColor: "#F0A3B2",
            color: "white",
            padding: "10px 15px",
          }}
        >
          Đăng xuất
        </div>
      </Dropdown.Menu>
    </div>
  );
};

export default LoginMenu;
