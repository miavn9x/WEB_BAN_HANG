import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom"; // Thêm hook điều hướng
import axios from "axios";
import "../../../styles/Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState(""); // Lưu thông báo lỗi
  const [success, setSuccess] = useState(""); // Lưu thông báo thành công
  const [loading, setLoading] = useState(false); // Quản lý trạng thái loading

  const navigate = useNavigate(); // Hook điều hướng

  // Xử lý thay đổi giá trị input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Gửi dữ liệu đăng ký
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Hiển thị trạng thái loading
    setError(""); // Xóa lỗi cũ
    setSuccess(""); // Xóa thành công cũ

    try {
      const response = await axios.post(
        `/api/auth/register/`,
        formData
      );
      setSuccess("Đăng ký thành công! Vui lòng đăng nhập.");
      setError(""); // Xóa thông báo lỗi
      console.log("Đăng ký thành công:", response.data); // Log thông tin người dùng mới

      setTimeout(() => navigate("/login"), 2000); // Chuyển hướng sau 2 giây
    } catch (err) {
      console.error("Lỗi đăng ký:", err.response?.data); // In chi tiết lỗi trả về từ server
      setError(err.response?.data?.message || "Đăng ký thất bại!");
      setSuccess(""); // Xóa thông báo thành công
    } finally {
      setLoading(false); // Tắt trạng thái loading
    }

  };

  return (
    <Container className="register-container">
      <h3 className="text-center mb-2">ĐĂNG KÝ TÀI KHOẢN</h3>
      <p className="text-center mb-4">
        Bạn đã có tài khoản?&nbsp;
        <Link
          to="/login"
          className="text-decoration-none"
          style={{ color: "#FF6F91" }}
        >
          Đăng nhập tại đây
        </Link>
      </p>

      {/* Hiển thị thông báo lỗi */}
      {error && <div className="alert alert-danger">{error}</div>}
      {/* Hiển thị thông báo thành công */}
      {success && <div className="alert alert-success">{success}</div>}

      <h5 className="text-center mb-4">THÔNG TIN CÁ NHÂN</h5>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>
            Họ <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Họ"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            Tên <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Tên"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            Số điện thoại <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Số điện thoại"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            Email <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            Mật khẩu <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Mật khẩu"
            required
          />
        </Form.Group>

        <Button
          type="submit"
          className="w-100 rounded-pill fw-bold"
          style={{
            backgroundColor: "#ffc0cb",
            border: "none",
            padding: "10px 0",
          }}
          disabled={loading} // Disable nút khi đang loading
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </Button>
      </Form>
    </Container>
  );
};

export default Register;
