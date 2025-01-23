import React, { useEffect, useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import "../../../styles/ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        `/api/auth/forgot-password/`,
        { email }
      );

      setMessage(response.data.message);
    } catch (err) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại sau."
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
    <Container className="forgot-password-container">
      <h2 className="text-center mb-2">ĐẶT LẠI MẬT KHẨU</h2>
      <p className="text-center mb-4">
        Chúng tôi sẽ gửi cho bạn một email để kích hoạt việc đặt lại mật khẩu.
      </p>

      <div className="text-center pb-3">
        {message && <div className="text-success">{message}</div>}
        {error && <div className="text-danger">{error}</div>}
      </div>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-4">
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            style={{padding: "10px 12px"}}
          />
        </Form.Group>

        <Button
          type="submit"
          className="w-100 rounded-pill mb-3 fw-bold"
          style={{
            backgroundColor: "#ffc0cb",
            border: "none",
            padding: "10px 0",
          }}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Lấy lại mật khẩu"}
        </Button>

        <div className="text-center">
          <Link to="/login" className="text-dark text-decoration-none">
            Quay lại
          </Link>
        </div>
      </Form>
    </Container>
  );
};

export default ForgotPassword;
