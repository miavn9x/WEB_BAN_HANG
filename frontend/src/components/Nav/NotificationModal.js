import React, { useEffect, useState } from "react";
import { Modal, Button, Card, Row, Col, Form } from "react-bootstrap";
import axios from "axios";
import { FaBell, FaRegClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./NotificationModal.css"; // Import CSS

const NotificationModal = ({ show, handleClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]); // Theo dõi các thông báo được chọn
  const navigate = useNavigate();

  // Hàm lấy thông báo từ API và cập nhật localStorage
  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    // Nếu không có token (người dùng đã đăng xuất) thì không thực hiện gọi API và xóa cache thông báo
    if (!token) {
      setNotifications([]);
      localStorage.removeItem("notifications");
      return;
    }
    try {
      const res = await axios.get("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setNotifications(res.data.notifications);
        localStorage.setItem(
          "notifications",
          JSON.stringify(res.data.notifications)
        );
      }
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
    }
  };

  useEffect(() => {
    if (show) {
      const token = localStorage.getItem("token");
      // Nếu không có token, xóa thông báo và không tiến hành lấy dữ liệu
      if (!token) {
        setNotifications([]);
        localStorage.removeItem("notifications");
        return;
      }

      // Kiểm tra localStorage trước để hiển thị nhanh cache thông báo (nếu có)
      const cachedNotifications = localStorage.getItem("notifications");
      if (cachedNotifications) {
        setNotifications(JSON.parse(cachedNotifications));
      }
      // Lấy thông báo từ server
      fetchNotifications();

      // Sử dụng polling để cập nhật thông báo theo thời gian thực (ví dụ mỗi 10 giây)
      const intervalId = setInterval(() => {
        fetchNotifications();
      }, 10000);

      return () => clearInterval(intervalId);
    }
  }, [show]);

  // Sắp xếp thông báo: chưa đọc (unread) ở trên, đã đọc (read) ở dưới và theo thời gian (mới nhất trước)
  const sortedNotifications = [...notifications].sort((a, b) => {
    if (a.read === b.read) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return a.read - b.read;
  });

  // Xử lý khi người dùng xem chi tiết đơn hàng từ thông báo
  const handleViewOrderDetails = async (orderId, notificationId) => {
    try {
      // Đánh dấu thông báo là đã đọc
      await axios.put(
        `/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // Cập nhật trạng thái đã đọc cho thông báo được chọn
      const updatedNotifications = notifications.map((noti) =>
        noti._id === notificationId ? { ...noti, read: true } : noti
      );
      setNotifications(updatedNotifications);
      localStorage.setItem(
        "notifications",
        JSON.stringify(updatedNotifications)
      );

      // Chuyển hướng đến trang chi tiết đơn hàng và đóng modal
      navigate(`/order-history/${orderId}`);
      handleClose();
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
    }
  };

  // Toggle selection của 1 thông báo
  const toggleSelectNotification = (notificationId) => {
    setSelectedNotifications((prevSelected) =>
      prevSelected.includes(notificationId)
        ? prevSelected.filter((id) => id !== notificationId)
        : [...prevSelected, notificationId]
    );
  };

  // Hàm chọn tất cả các thông báo
  const handleSelectAllNotifications = () => {
    setSelectedNotifications(notifications.map((noti) => noti._id));
  };

  // Hàm xóa các thông báo được chọn
  const handleDeleteNotifications = async () => {
    try {
      await Promise.all(
        selectedNotifications.map((id) =>
          axios.delete(`/api/notifications/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
        )
      );
      const updatedNotifications = notifications.filter(
        (noti) => !selectedNotifications.includes(noti._id)
      );
      setNotifications(updatedNotifications);
      localStorage.setItem(
        "notifications",
        JSON.stringify(updatedNotifications)
      );
      setSelectedNotifications([]);
    } catch (error) {
      console.error("Lỗi khi xóa thông báo:", error);
    }
  };

  // Xác định văn bản hiển thị trên nút dựa vào số lượng thông báo được chọn
  const getActionButtonText = () => {
    return selectedNotifications.length === notifications.length
      ? "Xóa tất cả"
      : "Xóa đã chọn";
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      className="notification-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <FaBell size={25} className="text-warning me-2" />
          <span className="fs-4">Thông báo của tôi</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {notifications.length === 0 ? (
          <div className="text-center py-5">
            <img
              className="cart-empty-image"
              src="https://theme.hstatic.net/200000381339/1001207774/14/cart_empty_background.png?v=164"
              alt="Giỏ hàng trống"
            />
            <p>Không có thông báo nào.</p>
          </div>
        ) : (
          <Row>
            {sortedNotifications.map((noti) => (
              <Col key={noti._id} md={6} className="mb-3">
                <Card
                  className={`shadow-sm ${
                    noti.read ? "bg-white" : "bg-custom"
                  }`}
                  style={{
                    cursor: "pointer",
                    borderRadius: "8px",
                    position: "relative",
                  }}
                >
                  <Card.Body>
                    <div className="d-flex align-items-center">
                      <Form.Check
                        type="checkbox"
                        checked={selectedNotifications.includes(noti._id)}
                        onChange={() => toggleSelectNotification(noti._id)}
                        className="me-2"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <h6 className="fw-bold text-center">{noti.title}</h6>
                    </div>
                    <p className="text-muted">{noti.message}</p>
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">
                        <FaRegClock className="me-1" />
                        {new Date(noti.createdAt).toLocaleString()}
                      </small>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewOrderDetails(noti.order, noti._id);
                        }}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
        {selectedNotifications.length === 0 ? (
          <Button variant="warning" onClick={handleSelectAllNotifications}>
            Chọn tất cả
          </Button>
        ) : (
          <Button variant="danger" onClick={handleDeleteNotifications}>
            {getActionButtonText()}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default NotificationModal;
