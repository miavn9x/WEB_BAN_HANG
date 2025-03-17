import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Link } from "@mui/material"; // Dùng Link từ Material UI
import "../../styles/Error403.css";

const Error403 = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.role !== "admin") {
          navigate("/Error403");
        }
      } catch (error) {
        navigate("/login");
      }
    }
  }, [token, navigate]);

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <div className="error-403-container">
            <div className="error-403-content">
              <h1 className="error-403-title" style={{ color: "#8B4513" }}>
                403
              </h1>
              <h2 className="error-403-subtitle" style={{ color: "#8B4513" }}>
                Truy cập Bị Từ Chối
              </h2>
              <p className="error-403-text">
                Bạn không có quyền truy cập trang này của Go Book. Vui lòng quay
                lại Trang chủ để tiếp tục.
              </p>
              <Link
                href="/"
                className="error-403-button"
                style={{ backgroundColor: "#8B4513", color: "#fff" }}
              >
                Quay lại Trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error403;
