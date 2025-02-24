import React, { useState, useRef, useEffect } from "react";
import "./ChatButtons.css";
import chatIcon from "../../assets/chat-icon.png"; // Icon chat chính
import zaloIcon from "../../assets/zalo-icon.png"; // Icon Zalo
import facebookIcon from "../../assets/facebook-icon.png"; // Icon Facebook

const ChatToggle = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const containerRef = useRef(null);

  // Hàm chuyển đổi hiển thị menu
  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuVisible((prev) => !prev);
  };

  // Đóng menu khi click bên ngoài vùng chứa
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setMenuVisible(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="chat-toggle-container" ref={containerRef}>
      <button className="chat-main-button" onClick={toggleMenu}>
        {/* Ẩn icon chat chính khi menu hiển thị */}
        {!menuVisible && (
          <img src={chatIcon} alt="Chat" className="chat-main-icon" />
        )}
      </button>
      {menuVisible && (
        <div className="chat-menu">
          <a
            href="https://zalo.me/your-zalo-id"
            target="_blank"
            rel="noopener noreferrer"
            className="chat-menu-item"
          >
            <img src={zaloIcon} alt="Zalo" className="chat-menu-icon" />
          </a>
          <a
            href="https://m.me/your-facebook-page"
            target="_blank"
            rel="noopener noreferrer"
            className="chat-menu-item"
          >
            <img src={facebookIcon} alt="Facebook" className="chat-menu-icon" />
          </a>
        </div>
      )}
    </div>
  );
};

export default ChatToggle;
