import React, { useEffect, useState, useMemo } from "react";
import { Modal, Button, Card, Row, Col, Form } from "react-bootstrap";
import axios from "axios";
import { FaBell, FaRegClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./NotificationModal.css";

const NotificationModal = ({ show, handleClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const navigate = useNavigate();

  // Lấy thông báo trực tiếp từ API và lưu vào state
  const fetchNotifications = async () => {
    const token = localStorage.getItem("token"); // Token dùng để xác thực
    if (!token) {
      setNotifications([]);
      return;
    }
    try {
      const res = await axios.get("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
    }
  };

  useEffect(() => {
    if (show) {
      const token = localStorage.getItem("token");
      if (!token) {
        setNotifications([]);
        return;
      }
      fetchNotifications();

      // Polling cập nhật thông báo mỗi 15 giây (tăng khoảng thời gian polling)
      const intervalId = setInterval(fetchNotifications, 15000);
      return () => clearInterval(intervalId);
    }
  }, [show]);

  // Sử dụng useMemo để sắp xếp thông báo chỉ khi notifications thay đổi
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      if (a.read === b.read) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return a.read - b.read;
    });
  }, [notifications]);

  const handleViewOrderDetails = async (orderId, notificationId) => {
    try {
      await axios.put(
        `/api/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      // Cập nhật trạng thái đã đọc trong state
      const updatedNotifications = notifications.map((noti) =>
        noti._id === notificationId ? { ...noti, read: true } : noti
      );
      setNotifications(updatedNotifications);
      navigate(`/order-history/${orderId}`);
      handleClose();
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
    }
  };

  const toggleSelectNotification = (notificationId) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAllNotifications = () => {
    setSelectedNotifications(notifications.map((noti) => noti._id));
  };

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
      setSelectedNotifications([]);
    } catch (error) {
      console.error("Lỗi khi xóa thông báo:", error);
    }
  };

  const getActionButtonText = () =>
    selectedNotifications.length === notifications.length
      ? "Xóa tất cả"
      : "Xóa đã chọn";

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
