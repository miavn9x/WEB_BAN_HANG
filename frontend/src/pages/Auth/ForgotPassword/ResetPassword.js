import React, { useEffect, useState } from "react";
import { Container, Form, Button,  } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Mật khẩu không khớp!");
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post(
        `/api/auth/reset-password/${token}`, // Chỉ cần đường dẫn tương đối
        { newPassword: password }
      );

      setMessage(response.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại sau!"
      );
    } finally {
      setLoading(false);
    }
  };
  // thông báo tắt sau 2 giây

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("");
        setError("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  return (
    <Container className="login-container">
      <h2 className="text-center mb-4">ĐẶT LẠI MẬT KHẨU</h2>

      <div className="text-center">
        {message && <div className="text-success">{message}</div>}
        {error && <div className="text-danger">{error}</div>}
      </div>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>
            Mật khẩu mới <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu mới"
            required
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>
            Xác nhận mật khẩu <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
            required
            style={{ padding: "10px" }}
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
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Xác nhận"}
        </Button>
      </Form>
    </Container>
  );
};

export default ResetPassword;
