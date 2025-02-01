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
import "../../../src/styles/OrderHistory.css"; // Import file CSS

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

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vui lòng đăng nhập!");

      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể hủy đơn hàng");
      }

      if (data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId
              ? { ...order, orderStatus: "Đã hủy" }
              : order
          )
        );

        alert("Hủy đơn hàng thành công!");
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "Có lỗi xảy ra khi hủy đơn hàng!");
    }
  };

  const canCancelOrder = (orderStatus) => {
    const cancellableStatuses = ["Đang xử lý", "Đã xác nhận"];
    return cancellableStatuses.includes(orderStatus);
  };

  // Các hàm helper cho badges
  const getOrderStatusBadge = (status) => {
    const statusConfig = {
      "Đang xử lý": { color: "warning", text: "Đang xử lý" },
      "Đã xác nhận": { color: "info", text: "Đã xác nhận" },
      "Đang giao hàng": { color: "primary", text: "Đang giao hàng" },
      "Đã giao hàng": { color: "success", text: "Đã giao hàng" },
      "Đã hủy": { color: "danger", text: "Đã hủy" },
    };

    const config = statusConfig[status] || { color: "secondary", text: status };
    return <Badge bg={config.color}>{config.text}</Badge>;
  };

const getPaymentStatusBadge = (status) => {
  const statusConfig = {
    "Chưa thanh toán": { color: "danger", text: "Chưa thanh toán" },
    "Đợi xác nhận": { color: "warning", text: "Đợi xác nhận" },
    "Đã thanh toán": { color: "success", text: "Đã thanh toán" },
    "Hoàn tiền": { color: "secondary", text: "Hoàn tiền" }, // Added Hoàn tiền status
  };

  const config = statusConfig[status] || { color: "secondary", text: status };
  return <Badge bg={config.color}>{config.text}</Badge>;
};


  const getPaymentMethodLabel = (method) => {
    const methods = {
      cod: "Thanh toán khi nhận hàng",
      bank: "Chuyển khoản ngân hàng",
    };
    return methods[method] || method;
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <Container className="order-history-container">
      <h2 className="my-4 order-history-title">Lịch sử đơn hàng</h2>
      <Table responsive striped bordered hover className="order-history-table">
        <thead>
          <tr>
            <th>Mã đơn hàng</th>
            <th>Ngày đặt</th>
            <th>Tổng tiền</th>
            <th>Phương thức thanh toán</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderId}>
              <td>{order.orderId}</td>
              <td>{order.formattedOrderDate}</td>
              <td>{formatter(order.totalAmount)}</td>
              <td>{getPaymentMethodLabel(order.paymentMethod)}</td>
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
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        dialogClassName="order-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết đơn hàng: {selectedOrder?.orderId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <h5>Thông tin đơn hàng</h5>
                  <p>Ngày đặt: {selectedOrder.formattedOrderDate}</p>
                  <p>
                    Trạng thái đơn hàng:{" "}
                    {getOrderStatusBadge(selectedOrder.orderStatus)}
                  </p>
                  <p>
                    Trạng thái thanh toán:{" "}
                    {getPaymentStatusBadge(selectedOrder.paymentStatus)}{" "}
                    {/* Updated here */}
                  </p>
                  <p>
                    Phương thức thanh toán:{" "}
                    {getPaymentMethodLabel(selectedOrder.paymentMethod)}
                  </p>
                </Col>
                <Col md={6}>
                  <h5>Thông tin khách hàng</h5>
                  <p>Họ tên: {selectedOrder.userInfo.fullName}</p>
                  <p>Số điện thoại: {selectedOrder.userInfo.phone}</p>
                  <p>Địa chỉ: {selectedOrder.userInfo.address}</p>
                </Col>
              </Row>
              <Row>
                <Col>
                  <h5>Chi tiết thanh toán</h5>
                  <div className="payment-details">
                    <p>Tạm tính: {formatter(selectedOrder.subtotal)}</p>
                    <p>
                      Phí vận chuyển: {formatter(selectedOrder.shippingFee)}
                    </p>
                    <p className="fw-bold">
                      Tổng cộng: {formatter(selectedOrder.totalAmount)}
                    </p>
                  </div>
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
                            src={item.image}
                            alt={item.name}
                            style={{ width: "50px", marginRight: "10px" }}
                          />
                          {item.name}
                        </div>
                      </td>
                      <td>{formatter(item.price)}</td>
                      <td>{item.quantity}</td>
                      <td>{formatter(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-end">
                      <strong>Tạm tính:</strong>
                    </td>
                    <td>{formatter(selectedOrder.subtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-end">
                      <strong>Phí vận chuyển:</strong>
                    </td>
                    <td>{formatter(selectedOrder.shippingFee)}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-end">
                      <strong>Tổng cộng:</strong>
                    </td>
                    <td>
                      <strong className="text-danger">
                        {formatter(selectedOrder.totalAmount)}
                      </strong>
                    </td>
                  </tr>
                </tfoot>
              </Table>
              {/* Nút Hủy đơn hàng */}
              {canCancelOrder(selectedOrder.orderStatus) ? (
                <Button
                  variant="danger"
                  onClick={() => handleCancelOrder(selectedOrder.orderId)}
                >
                  Hủy đơn hàng
                </Button>
              ) : (
                <div className="text-danger">
                  <small>
                    {selectedOrder.orderStatus === "Đã hủy"
                      ? "Đơn hàng đã được hủy"
                      : `* Không thể hủy đơn hàng ở trạng thái "${selectedOrder.orderStatus}"`}
                  </small>
                </div>
              )}
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
