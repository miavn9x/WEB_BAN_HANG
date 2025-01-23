import React, { useEffect, useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../../../styles/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook để chuyển hướng
  const location = useLocation(); // Hook để lấy đường dẫn hiện tại

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (localStorage.getItem("token")) {
      // Nếu có token, chuyển hướng đến trang dashboard
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Đang gửi request đăng nhập với:", formData);

      const response = await axios.post(`/api/auth/login/`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Phản hồi từ server:", response.data);

      if (response.data.token) {
        // Lưu thông tin vào localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Lưu lại trang trước khi đăng nhập
        const redirectTo = location.state?.from || "/"; // Lấy URL trước khi đăng nhập
        navigate(redirectTo); // Chuyển hướng đến trang cũ
      }
    } catch (err) {
      console.error("Chi tiết lỗi:", err.response?.data);
      setError(
        err.response?.data?.message ||
          "Không thể kết nối đến server. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  // Thông báo tắt sau 2 giây
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <Container className="login-container">
      <h3 className="text-center mb-2">ĐĂNG NHẬP TÀI KHOẢN</h3>
      <p className="text-center mb-4">
        Bạn chưa có tài khoản?{" "}
        <Link
          to="/register"
          className="text-decoration-none"
          style={{ color: "#FF6F91" }}
        >
          Đăng ký tại đây
        </Link>
      </p>

      <div className="text-center pb-3">
        {error && <div className="text-danger">{error}</div>}
      </div>
      <Form onSubmit={handleSubmit}>
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

        <div className="mb-3">
          <div className="text-dark text-decoration-none">
            Quên mật khẩu?&nbsp;
            <Link
              to="/forgot-password"
              className="text-decoration-none"
              style={{ color: "#FF6F91" }}
            >
              Nhấn vào đây
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="w-100 rounded-pill fw-bold"
          style={{
            backgroundColor: "#ffc0cb",
            border: "none",
            padding: "10px 0",
          }}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </Button>
      </Form>
    </Container>
  );
};

export default Login;
