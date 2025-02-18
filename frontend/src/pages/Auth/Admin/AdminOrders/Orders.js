import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Modal,
  Button,
  Row,
  Col,
  Badge,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import { formatter } from "../../../../utils/fomater";
import "../../../../styles/Orders.css";
import { ButtonBase } from "@mui/material";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState({
    orderStatus: "",
    paymentStatus: "",
  });
  // Thêm state cho ghi chú của khách hàng
  const [newCustomerNote, setNewCustomerNote] = useState("");

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const totalPages = Math.ceil(orders.length / ordersPerPage);

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
      // Sắp xếp đơn hàng theo ngày tạo (newest first)
      const sortedOrders = response.data.orders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sortedOrders);
      // Nếu có đơn hàng mới, reset về trang 1
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Không thể tải danh sách đơn hàng.");
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
    // Gán giá trị ghi chú của khách hàng (nếu có)
    setNewCustomerNote(order.customerNote || "");
    setShowModal(true);
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);

    if (!newStatus.orderStatus || !newStatus.paymentStatus) {
      alert("Vui lòng chọn trạng thái hợp lệ.");
      setUpdating(false);
      return;
    }

    try {
      // Refund logic nếu chuyển thanh toán sang "Hoàn tiền"
      if (
        newStatus.paymentStatus === "Hoàn tiền" &&
        selectedOrder.paymentStatus !== "Hoàn tiền"
      ) {
        if (
          window.confirm(
            "Bạn có chắc chắn muốn hoàn tiền cho đơn hàng này không?"
          )
        ) {
          const refundResponse = await axios.post(
            `/api/payment/refund`,
            {
              orderId: selectedOrder._id,
              amount: selectedOrder.totalAmount,
              paymentMethod: "Banking",
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

      const response = await axios.put(
        `/api/order/${selectedOrder._id}`,
        {
          orderStatus: newStatus.orderStatus,
          paymentStatus: newStatus.paymentStatus,
          // Gửi luôn ghi chú của khách hàng (có thể cập nhật nếu admin cần)
          customerNote: newCustomerNote,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

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

  // Nếu đang tải, hiển thị spinner tương tự như trang trước
  if (loading) {
    return (
      <div className="loading-container text-center my-5">
        <Spinner
          animation="border"
          variant="success"
          className="loading-spinner"
        />
        <div>Đang tải đơn hàng...</div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message text-center my-5">{error}</div>;
  }

  // Phân trang: Tính toán các đơn hàng hiển thị theo trang hiện tại
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <Container className="orders-container">
      <ButtonBase
        href="/admin/order_Dashboard"
        className="mt-2"
        style={{ color: "#323d42" }}
      >
        Quay lại: trang quản lý
      </ButtonBase>
      <h2 className="my-4 orders-title">Quản lý đặt hàng</h2>

      {/* Khung hiển thị đơn hàng với chiều cao cố định 50vh và thanh cuộn */}
      <div style={{ height: "50vh", overflowY: "auto" }}>
        {currentOrders && currentOrders.length > 0 ? (
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
              {currentOrders.map((order) => (
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
        ) : (
          <div className="text-center my-4">Không có đơn hàng nào</div>
        )}
      </div>

      {/* Bộ nút phân trang */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-3 flex-nowrap">
          <button
            className="btn btn-secondary btn-sm me-2"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            &laquo; Trước
          </button>
          <span>
            Trang {currentPage} của {totalPages}
          </span>
          <button
            className="btn btn-secondary btn-sm ms-2"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            Sau &raquo;
          </button>
        </div>
      )}

      {/* Modal chi tiết đơn hàng */}
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
              {/* Thông tin đơn hàng */}
              <Col md={6}>
                <h5>Thông tin đơn hàng</h5>
                <p>
                  <strong>Mã đơn hàng:</strong> {selectedOrder.orderId}
                </p>
                <p>
                  <strong>Ngày đặt:</strong> {selectedOrder.formattedOrderDate}
                </p>
                <p>
                  <strong>Trạng thái đơn hàng:</strong>{" "}
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
                  <strong>Trạng thái thanh toán:</strong>{" "}
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
                    {/* <option value="Đợi xác nhận">Đợi xác nhận</option> */}
                    <option value="Đã thanh toán">Đã thanh toán</option>
                    <option value="Hoàn tiền">Hoàn tiền</option>
                  </select>
                </p>
                <p>
                  <strong>Tổng tiền:</strong>{" "}
                  {formatter(selectedOrder.totalAmount)}
                </p>
                <p>
                  <strong>Phương thức thanh toán:</strong>{" "}
                  {selectedOrder.paymentMethod}
                </p>
                <p>
                  <strong>Phí giao hàng:</strong>{" "}
                  {formatter(selectedOrder.shippingFee)}
                </p>
                {selectedOrder.discountCode && (
                  <p>
                    <strong>Mã giảm giá:</strong> {selectedOrder.discountCode}
                  </p>
                )}
                {selectedOrder.serviceFee ? (
                  <p>
                    <strong>Phí dịch vụ:</strong>{" "}
                    {formatter(selectedOrder.serviceFee)}
                  </p>
                ) : null}
                {selectedOrder.estimatedDeliveryDate && (
                  <p>
                    <strong>Ngày giao dự kiến:</strong>{" "}
                    {new Date(
                      selectedOrder.estimatedDeliveryDate
                    ).toLocaleString("vi-VN")}
                  </p>
                )}
                {selectedOrder.shippingMethod && (
                  <p>
                    <strong>Phương thức vận chuyển:</strong>{" "}
                    {selectedOrder.shippingMethod}
                  </p>
                )}
              </Col>
              {/* Thông tin người mua và sản phẩm */}
              <Col md={6}>
                <h5>Thông tin người mua</h5>
                <p>
                  <strong>Họ và tên:</strong> {selectedOrder.userInfo.fullName}
                </p>
                <p>
                  <strong>Số điện thoại:</strong> {selectedOrder.userInfo.phone}
                </p>
                <p>
                  <strong>Email:</strong> {selectedOrder.userInfo.email}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {selectedOrder.userInfo.address}
                </p>
                <h5 className="mt-3">Danh sách sản phẩm</h5>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="mb-2 border-bottom pb-2">
                    <p>
                      <strong>Tên sản phẩm:</strong> {item.name}
                    </p>
                    <p>
                      <strong>Số lượng:</strong> {item.quantity}
                    </p>
                    <p>
                      <strong>Giá:</strong> {formatter(item.price)}
                    </p>
                    <p>
                      <strong>Ghi chú của khách hàng:</strong>
                    </p>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={newCustomerNote}
                      onChange={(e) => setNewCustomerNote(e.target.value)}
                    />
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: "50px", height: "50px" }}
                      />
                    )}
                  </div>
                ))}
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
