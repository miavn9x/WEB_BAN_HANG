import React, { useState, useEffect } from "react";
import "../styles/ScrollToTopButton.css"; // Import file CSS đã chỉnh sửa
import { VscChevronUp } from "react-icons/vsc";const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Hàm kiểm tra vị trí cuộn của trang
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Hàm cuộn mượt về đầu trang
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Lắng nghe sự kiện scroll của cửa sổ
  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <div className="scroll-to-top">
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="scroll-button"
          aria-label="Scroll to top"
        >
          <VscChevronUp className="icon" />
        </button>
      )}
    </div>
  );
};

export default ScrollToTopButton;
