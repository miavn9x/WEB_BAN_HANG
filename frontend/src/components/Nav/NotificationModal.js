import React, { useEffect, useState } from "react";
import { Modal, Button, Card, Row, Col, Form } from "react-bootstrap";
import axios from "axios";
import { FaBell, FaRegClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./NotificationModal.css"; // Import CSS

const NotificationModal = ({ show, handleClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]); // Track selected notifications
  const navigate = useNavigate();

  useEffect(() => {
    if (show) {
      const fetchNotifications = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get("/api/notifications", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data.success) {
            setNotifications(res.data.notifications); // Load notifications
          }
        } catch (error) {
          console.error("Lỗi khi tải thông báo:", error);
        }
      };
      fetchNotifications();
    }
  }, [show]);

  // Xử lý khi xem chi tiết đơn hàng từ thông báo
  const handleViewOrderDetails = async (orderId, notificationId) => {
    try {
      // Đánh dấu thông báo là đã đọc khi người dùng xem
      await axios.put(
        `/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Chuyển hướng đến trang chi tiết đơn hàng
      navigate(`/order-history/${orderId}`);
      handleClose();
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
    }
  };

  // Toggle selection of a notification
  const toggleSelectNotification = (notificationId) => {
    setSelectedNotifications((prevSelected) =>
      prevSelected.includes(notificationId)
        ? prevSelected.filter((id) => id !== notificationId)
        : [...prevSelected, notificationId]
    );
  };

  // Xử lý xóa đã chọn thông báo (nếu cần thiết sau này)
  const handleDeleteNotifications = async () => {
    try {
      // Send request to delete selected notifications (if needed)
      await Promise.all(
        selectedNotifications.map((id) =>
          axios.delete(`/api/notifications/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
        )
      );
      // Remove deleted notifications from the state (if deleted)
      setNotifications(
        notifications.filter(
          (noti) => !selectedNotifications.includes(noti._id)
        )
      );
      setSelectedNotifications([]); // Clear selected notifications after deletion
    } catch (error) {
      console.error("Lỗi khi xóa thông báo:", error);
    }
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
            {notifications.map((noti) => (
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
          <Button variant="warning" onClick={handleDeleteNotifications}>
            Xóa đã chọn
          </Button>
        ) : (
          <Button variant="danger" onClick={handleDeleteNotifications}>
            Xóa đã chọn
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default NotificationModal;
