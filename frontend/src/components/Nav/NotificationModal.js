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
      // Cập nhật lại danh sách thông báo sau khi xóa
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

  // Xác định văn bản hiển thị trên nút dựa vào số lượng thông báo đã chọn
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
                  onClick={() => {
                    // Khi click vào Card (ngoại trừ checkbox và nút xem chi tiết) thì không thực hiện hành động gì
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
          // Nếu chưa chọn thông báo nào, hiển thị nút "Chọn tất cả"
          <Button variant="warning" onClick={handleSelectAllNotifications}>
            Chọn tất cả
          </Button>
        ) : (
          // Nếu có thông báo được chọn
          <Button variant="danger" onClick={handleDeleteNotifications}>
            {getActionButtonText()}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default NotificationModal;
