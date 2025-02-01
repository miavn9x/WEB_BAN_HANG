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
import axios from "axios";
import { formatter } from "../../../../utils/fomater";
import "../../../../styles/Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState({
    orderStatus: "",
    paymentStatus: "",
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("/api/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setOrders(response.data.orders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      alert("Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = (order) => {
    setSelectedOrder(order);
    setNewStatus({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
    });
    setShowModal(true);
  };

  // frontend/Orders.js
  const handleUpdateStatus = async () => {
    setUpdating(true);

    if (!newStatus.orderStatus || !newStatus.paymentStatus) {
      alert("Vui lòng chọn trạng thái hợp lệ.");
      setUpdating(false);
      return;
    }

    try {
      // Refund logic if the payment status is changing to "Hoàn tiền"
      if (
        newStatus.paymentStatus === "Hoàn tiền" &&
        selectedOrder.paymentStatus !== "Hoàn tiền"
      ) {
        if (
          window.confirm(
            "Bạn có chắc chắn muốn hoàn tiền cho đơn hàng này không?"
          )
        ) {
          // Call backend to perform the refund
          const refundResponse = await axios.post(
            `/api/payment/refund`,
            {
              orderId: selectedOrder._id,
              amount: selectedOrder.totalAmount,
              paymentMethod: "Banking", // or determine based on the order
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (!refundResponse.data.success) {
            alert("Lỗi khi hoàn tiền. Vui lòng thử lại.");
            setUpdating(false);
            return;
          } else {
            alert("Hoàn tiền thành công!");
          }
        }
      }

      // Update order status (orderStatus and paymentStatus)
      const response = await axios.put(
        `/api/order/${selectedOrder._id}`,
        {
          orderStatus: newStatus.orderStatus,
          paymentStatus: newStatus.paymentStatus, // Ensure it's "Hoàn tiền" here
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update orders in the frontend state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === selectedOrder._id ? response.data.order : order
        )
      );
      alert("Cập nhật trạng thái thành công!");
      setShowModal(false);
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      alert(
        `Lỗi khi cập nhật trạng thái: ${
          err.response?.data.message || err.message
        }`
      );
    } finally {
      setUpdating(false);
    }
  };

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
      "Hoàn tiền": { color: "info", text: "Hoàn tiền" },
    };

    const config = statusConfig[status] || { color: "secondary", text: status };
    return <Badge bg={config.color}>{config.text}</Badge>;
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <Container className="orders-container">
      <h2 className="my-4 orders-title">Lịch sử đơn hàng</h2>
      <Table responsive striped bordered hover className="orders-table">
        <thead>
          <tr>
            <th>Mã đơn hàng</th>
            <th>Ngày đặt</th>
            <th>Tổng tiền</th>
            <th>Trạng thái đơn hàng</th>
            <th>Trạng thái thanh toán</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order.orderId}</td>
              <td>{order.formattedOrderDate}</td>
              <td>{formatter(order.totalAmount)}</td>
              <td>{getOrderStatusBadge(order.orderStatus)}</td>
              <td>{getPaymentStatusBadge(order.paymentStatus)}</td>
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
      {/* Modal */}
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
            <Row>
              <Col md={6}>
                <h5>Thông tin đơn hàng</h5>
                <p>Ngày đặt: {selectedOrder.formattedOrderDate}</p>
                <p>
                  Trạng thái đơn hàng:
                  <select
                    value={newStatus.orderStatus}
                    onChange={(e) =>
                      setNewStatus((prev) => ({
                        ...prev,
                        orderStatus: e.target.value,
                      }))
                    }
                  >
                    <option value="Đang xử lý">Đang xử lý</option>
                    <option value="Đã xác nhận">Đã xác nhận</option>
                    <option value="Đang giao hàng">Đang giao hàng</option>
                    <option value="Đã giao hàng">Đã giao hàng</option>
                    <option value="Đã hủy">Đã hủy</option>
                  </select>
                </p>
                <p>
                  Trạng thái thanh toán:
                  <select
                    value={newStatus.paymentStatus}
                    onChange={(e) =>
                      setNewStatus((prev) => ({
                        ...prev,
                        paymentStatus: e.target.value,
                      }))
                    }
                  >
                    <option value="Chưa thanh toán">Chưa thanh toán</option>
                    <option value="Đợi xác nhận">Đợi xác nhận</option>
                    <option value="Đã thanh toán">Đã thanh toán</option>
                    <option value="Hoàn tiền">Hoàn tiền</option>
                  </select>
                </p>
              </Col>
            </Row>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
          {selectedOrder && (
            <Button
              variant="primary"
              onClick={handleUpdateStatus}
              disabled={updating}
            >
              {updating ? "Đang cập nhật..." : "Cập nhật trạng thái"}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Orders;
