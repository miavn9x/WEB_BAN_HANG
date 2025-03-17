import React, { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../../../styles/LoginMenu.css";
import { logoutUser } from "../../../redux/actions/authActions";
import { useDispatch } from "react-redux";

const LoginMenu = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 < Date.now()) {
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
        {/* Menu chung cho mọi user */}
        <Dropdown.Item onClick={() => navigate("/thong-tin-ca-nhan")}>
          Thông tin tài khoản
        </Dropdown.Item>
        <Dropdown.Item onClick={() => navigate("/order-history")}>
          Lịch sử mua hàng
        </Dropdown.Item>
        <Dropdown.Item onClick={() => navigate("/gio-hang")}>
          Giỏ hàng
        </Dropdown.Item>
        <Dropdown.Divider />

        {userRole === "admin" && (
          <>
            {/* Admin: truy cập toàn bộ */}
            <Dropdown.Item onClick={() => navigate("/admin/management")}>
              Quản Lý Admin
            </Dropdown.Item>
          </>
        )}

        {userRole === "posts" && (
          <>
            {/* Posts: chỉ truy cập trang đăng/sửa bài viết */}
            <Dropdown.Item onClick={() => navigate("/posts/create")}>
              Tạo bài viết
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate("/posts/management")}>
              Quản lý bài viết
            </Dropdown.Item>
          </>
        )}

        {userRole === "warehouse" && (
          <>
            {/* Warehouse: chỉ truy cập trang đăng/sửa sản phẩm */}
            <Dropdown.Item onClick={() => navigate("/product-warehouse")}>
              Quản lý kho
            </Dropdown.Item>
          </>
        )}

        {userRole === "accountant" && (
          <>
            {/* Accountant: chỉ truy cập trang đơn hàng */}
            <Dropdown.Item onClick={() => navigate("/DashboardAccountant")}>
              Kế toán
            </Dropdown.Item>
          </>
        )}

        <Dropdown.Divider />
        <div
          className="menu-item"
          onClick={handleLogout}
          style={{
            backgroundColor: "#8B4513",
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
