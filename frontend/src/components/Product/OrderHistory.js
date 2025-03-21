import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Modal,
  Button,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import { formatter } from "../../utils/fomater";
import OrderRating from "./OrderRating";
import "../../../src/styles/OrderHistory.css";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRating, setShowRating] = useState(false);

  // Phân trang
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  // Hàm lấy đơn hàng
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vui lòng đăng nhập!");
      const res = await axios.get("/api/ordershistory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        // Sắp xếp đơn hàng theo ngày tạo (mới nhất lên đầu)
        const sortedOrders = res.data.orders.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
        setCurrentPage(1);
      } else {
        throw new Error(res.data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component mount và đặt polling sau đó
  useEffect(() => {
    fetchOrders();
    const intervalId = setInterval(fetchOrders, 1000); // polling mỗi 1 giây
    return () => clearInterval(intervalId);
  }, []);

  // Lấy danh sách đơn hàng của trang hiện tại
  const currentOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleShowDetails = (order) => {
    setSelectedOrder(order);
    setShowRating(false); // reset form đánh giá khi mở modal mới
    setShowModal(true);
  };

  const handleRatingSuccess = () => {
    // Cập nhật trạng thái đã đánh giá cho đơn hàng
    const updatedOrder = { ...selectedOrder, rated: true };
    setSelectedOrder(updatedOrder);
    setOrders(
      orders.map((order) =>
        order.orderId === updatedOrder.orderId ? updatedOrder : order
      )
    );
    setShowRating(false);
  };

  const handleCancelOrder = async () => {
    if (
      !window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?") ||
      !selectedOrder
    )
      return;
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vui lòng đăng nhập!");

      // Gọi API hủy đơn hàng (POST /api/orders/:orderId/cancel)
      const res = await axios.post(
        `/api/orders/${selectedOrder.orderId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        const updatedOrder = { ...selectedOrder, orderStatus: "Đã hủy" };
        setSelectedOrder(updatedOrder);
        setOrders(
          orders.map((order) =>
            order.orderId === updatedOrder.orderId ? updatedOrder : order
          )
        );
        alert("Đơn hàng đã bị hủy thành công!");
      } else {
        alert(res.data.message || "Có lỗi xảy ra khi hủy đơn hàng");
      }
    } catch (error) {
      console.error("Error canceling order:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại sau.");
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="loading-container text-center my-5">
        <Spinner
          animation="border"
          variant="success"
          className="loading-spinner"
        />
        <div>Đang tải lịch sử đơn hàng...</div>
      </div>
    );
  }

  return (
    <Container className="order-history-container">
      <h2 className="my-4 order-history-title">Lịch sử đơn hàng</h2>
      <div style={{ height: "50vh", overflowY: "auto" }}>
        {orders.length > 0 ? (
          <Table
            responsive
            striped
            bordered
            hover
            className="order-history-table"
          >
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
              {currentOrders.map((order) => (
                <tr key={order.orderId}>
                  <td>{order.orderId}</td>
                  <td>{order.formattedOrderDate}</td>
                  <td>{formatter(order.totalAmount)}</td>
                  <td>
                    {order.paymentMethod === "cod"
                      ? "Thanh toán khi nhận hàng"
                      : "Chuyển khoản ngân hàng"}
                  </td>
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
        ) : (
          <div className="text-center my-4">Không có đơn hàng nào</div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-3 flex-nowrap">
          <Button
            variant="secondary"
            size="sm"
            className="me-2"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &laquo; Trước
          </Button>
          <span>
            Trang {currentPage} của {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            className="ms-2"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sau &raquo;
          </Button>
        </div>
      )}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        dialogClassName="order-history-modal"
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
                  <p>Trạng thái đơn hàng: {selectedOrder.orderStatus}</p>
                  <p>Trạng thái thanh toán: {selectedOrder.paymentStatus}</p>
                  <p>
                    Phương thức thanh toán:{" "}
                    {selectedOrder.paymentMethod === "cod"
                      ? "Thanh toán khi nhận hàng"
                      : "Chuyển khoản ngân hàng"}
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
              <div
                style={
                  selectedOrder.items.length > 5
                    ? { maxHeight: "200px", overflowY: "auto" }
                    : {}
                }
              >
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
                            {item.name.length > 10
                              ? item.name.substring(0, 10) + "..."
                              : item.name}
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
              </div>
              {/* Hiển thị nút đánh giá nếu đơn hàng đã giao, thanh toán và chưa được đánh giá */}
              {selectedOrder.orderStatus === "Đã giao hàng" &&
                selectedOrder.paymentStatus === "Đã thanh toán" &&
                !selectedOrder.rated &&
                !showRating && (
                  <div className="mt-3 text-end">
                    <Button
                      variant="primary"
                      onClick={() => setShowRating(true)}
                    >
                      Đánh giá
                    </Button>
                  </div>
                )}
              {selectedOrder.rated && (
                <div className="mt-3 text-center">
                  <strong>Đơn hàng đã được đánh giá.</strong>
                </div>
              )}
              {showRating &&
                selectedOrder &&
                selectedOrder.items.length > 0 && (
                  <>
                    <h5 className="mt-3">Đánh giá sản phẩm</h5>
                    <OrderRating
                      orderId={selectedOrder.orderId}
                      productIds={selectedOrder.items.map(
                        (item) => item.product._id
                      )}
                      initialRating={0}
                      onSuccess={handleRatingSuccess}
                    />
                  </>
                )}
              {/* Nút hủy đơn hàng chỉ hiển thị khi:
                  - orderStatus === "Đang xử lý" AND 
                  - paymentStatus === "Chưa thanh toán" */}
              {selectedOrder.orderStatus === "Đang xử lý" &&
                selectedOrder.paymentStatus === "Chưa thanh toán" && (
                  <div className="mt-3 text-end">
                    <Button variant="danger" onClick={handleCancelOrder}>
                      Hủy đơn hàng
                    </Button>
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
