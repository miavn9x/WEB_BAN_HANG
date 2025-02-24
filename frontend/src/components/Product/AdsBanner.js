import React, { useState, useEffect } from "react";

const AdsBanner = ({ imageUrl, redirectUrl, bannerId }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Kiểm tra query parameter để ẩn banner nếu cần
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("hideBanner") === "true") {
      setIsVisible(false);
      // Xóa query parameter khỏi URL để F5 reload lại sẽ hiển thị banner
      urlParams.delete("hideBanner");
      const newUrl =
        window.location.pathname +
        (urlParams.toString() ? "?" + urlParams.toString() : "");
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  const hideBanner = () => {
    setIsVisible(false);
  };

  // Xử lý đóng banner bằng nút X
  const handleClose = (e) => {
    e.stopPropagation();
    hideBanner();
  };

  // Xử lý khi click vào banner
  const handleClickBanner = () => {
    hideBanner();
    setTimeout(() => {
      // Thêm query parameter hideBanner vào URL chuyển hướng
      const url = new URL(redirectUrl, window.location.origin);
      url.searchParams.set("hideBanner", "true");
      window.location.href = url.toString();
    }, 500);
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
        onClick={handleClickBanner}
        style={{
          position: "relative",
          width: "600px",
          height: "auto",
          borderRadius: "8px",
          overflow: "hidden",
          cursor: "pointer",
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
