import React, { useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import "../../../styles/LoginMenu.css";

const LoginMenu = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    // console.log("Vai trò người dùng:", role);
    if (role) {
      setUserRole(role);
    } else {
      console.warn("Không tìm thấy 'userRole' trong localStorage.");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");

    const previousPage = location.state?.from || "/";
    navigate(previousPage);
  };

  return (
    <div className="Menulogin__dropdown">
      <Dropdown.Menu className="login__menu" renderMenuOnMount>
        <button className="close-button d-lg-block d-lg-none" onClick={onClose}>
          ✖
        </button>
        {userRole === "admin" ? (
          <>
            <div className="d-lg-block d-lg-none">
              <Dropdown.Item>&nbsp;&nbsp;</Dropdown.Item>
            </div>
            <Dropdown.Item onClick={() => navigate("/thong-tin-ca-nhan")}>
              Thông tin tài khoản
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate("/OrderHistory")}>
              Lịch sử mua hàng
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate("/gio-hang")}>
              Giỏ hàng
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => navigate("/admin/user-management")}>
              Quản lý user
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate("/admin/edit-product")}>
              Quản lý sản phẩm
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate("/admin/quan-ly-don-hang")}>
              Quản lý đơn hàng
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate("/admin/add-product")}>
              Đăng sản phẩm
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => navigate("/admin/add-bai-viet")}
            >
              Tạo bài viết
            </Dropdown.Item>
          </>
        ) : (
          <>
            <Dropdown.Item onClick={() => navigate("/thong-tin-ca-nhan")}>
              Thông tin tài khoản
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate("/OrderHistory")}>
              lịch sử mua hàng
            </Dropdown.Item>
            {/* <Dropdown.Item onClick={() => navigate("/user/san-pham-da-mua")}>
              Các sản phẩm đã mua
            </Dropdown.Item> */}
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
