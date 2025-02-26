import React, { useState, useEffect } from "react";

const AdsBanner = ({ imageUrl, redirectUrl, bannerId }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const lastHiddenTime = localStorage.getItem(`hideBanner_${bannerId}`);
    if (lastHiddenTime) {
      const timeElapsed = Date.now() - parseInt(lastHiddenTime, 10);
      if (timeElapsed < 60 * 60 * 1000) {
        setIsVisible(false);
        return;
      } else {
        localStorage.removeItem(`hideBanner_${bannerId}`);
      }
    }
  }, [bannerId]);

  const hideBanner = () => {
    setIsVisible(false);
    localStorage.setItem(`hideBanner_${bannerId}`, Date.now().toString());
  };

  const handleClose = (e) => {
    e.stopPropagation();
    hideBanner();
  };

  const handleClickBanner = () => {
    hideBanner();
    setTimeout(() => {
      const url = new URL(redirectUrl, window.location.origin);
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
