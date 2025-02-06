// src/components/NotificationIcon.js
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Badge } from "react-bootstrap";
import { FaBell } from "react-icons/fa";

const NotificationIcon = () => {
  const [notifications, setNotifications] = useState([]);
  // Giả sử userId của người dùng đang đăng nhập được lưu trong localStorage
  const userId = localStorage.getItem("userId") || "60d0fe4f5311236168a109cb";

  // Đóng gói fetchNotifications bằng useCallback để đảm bảo không thay đổi nếu userId không thay đổi.
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get(`/api/notifications?userId=${userId}`);
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <div style={{ position: "relative", cursor: "pointer" }}>
      <FaBell size={24} />
      {notifications.filter((n) => !n.read).length > 0 && (
        <Badge bg="danger" style={{ position: "absolute", top: -5, right: -5 }}>
          {notifications.filter((n) => !n.read).length}
        </Badge>
      )}
    </div>
  );
};

export default NotificationIcon;
