// components/OrderHistory.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Modal,
  Button,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import { formatter } from "../../utils/fomater";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Vui lòng đăng nhập!");
      }

      const response = await fetch("/api/ordershistory", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      Pending: "warning",
      Processing: "info",
      Shipped: "primary",
      Delivered: "success",
      Cancelled: "danger",
    };
    return <Badge bg={statusColors[status] || "secondary"}>{status}</Badge>;
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <Container>
      <h2 className="my-4">Lịch sử đơn hàng</h2>
      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Mã đơn hàng</th>
            <th>Ngày đặt</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Thanh toán</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order.orderId}</td>
              <td>{new Date(order.dateOrdered).toLocaleDateString()}</td>
              <td>{formatter(order.totalAmount)}</td>
              <td>{getStatusBadge(order.status)}</td>
              <td>{order.paymentMethod}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => handleShowDetails(order)}
                >
                  Xem chi tiết
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal Chi tiết đơn hàng */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết đơn hàng: {selectedOrder?.orderId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <h5>Thông tin đơn hàng</h5>
                  <p>
                    Ngày đặt:{" "}
                    {new Date(selectedOrder.dateOrdered).toLocaleString()}
                  </p>
                  <p>Trạng thái: {getStatusBadge(selectedOrder.status)}</p>
                  <p>Phương thức thanh toán: {selectedOrder.paymentMethod}</p>
                  <p>Tổng tiền: {formatter(selectedOrder.totalAmount)}</p>
                </Col>
                <Col md={6}>
                  <h5>Thông tin khách hàng</h5>
                  <p>Họ tên: {selectedOrder.userInfo.fullName}</p>
                  <p>Số điện thoại: {selectedOrder.userInfo.phone}</p>
                  <p>Địa chỉ: {selectedOrder.userInfo.address}</p>
                </Col>
              </Row>

              <h5>Chi tiết sản phẩm</h5>
              <Table responsive striped bordered>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            style={{ width: "50px", marginRight: "10px" }}
                          />
                          {item.product.name}
                        </div>
                      </td>
                      <td>{formatter(item.product.price)}</td>
                      <td>{item.quantity}</td>
                      <td>{formatter(item.product.price * item.quantity)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="3" className="text-end">
                      <strong>Tổng cộng:</strong>
                    </td>
                    <td>
                      <strong>{formatter(selectedOrder.totalAmount)}</strong>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OrderHistory;
