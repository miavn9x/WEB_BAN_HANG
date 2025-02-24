import React, { useState } from "react";

const AdsBanner = ({ imageUrl }) => {
  // Khởi tạo trạng thái hiển thị luôn là true khi load trang
  const [isVisible, setIsVisible] = useState(true);

  // Hàm xử lý khi người dùng đóng banner
  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "600px",
          height: "auto",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "transparent",
            border: "none",
            fontSize: "20px",
            fontWeight: "bold",
            cursor: "pointer",
            zIndex: 1,
            color: "#fff",
          }}
        >
          ×
        </button>
        <img
          src={imageUrl}
          alt="Quảng cáo"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
          }}
        />
      </div>
    </div>
  );
};

export default AdsBanner;
