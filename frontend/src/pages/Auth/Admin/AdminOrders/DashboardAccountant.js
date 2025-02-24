import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Card,
  Button,
  Table,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatter } from "../../../../utils/fomater";
import * as XLSX from "xlsx";

const statusConfig = {
  "Đang xử lý": { color: "warning", text: "Đang xử lý" },
  "Đã xác nhận": { color: "info", text: "Đã xác nhận" },
  "Đang giao hàng": { color: "primary", text: "Đang giao hàng" },
  "Đã giao hàng": { color: "success", text: "Đã giao hàng" },
  "Đã hủy": { color: "danger", text: "Đã hủy" },
};

// Chỉ định nghĩa lựa chọn lọc cho bảng đơn hàng
const exportFilterOptions = {
  order: [
    { value: "all", label: "Tất cả" },
    { value: "processing", label: statusConfig["Đang xử lý"].text },
    { value: "confirmed", label: statusConfig["Đã xác nhận"].text },
    { value: "delivered", label: statusConfig["Đã giao hàng"].text },
    { value: "canceled", label: statusConfig["Đã hủy"].text },
  ],
};

const DashboardAccountant = () => {
  const [orderStats, setOrderStats] = useState([]);
  const [revenueStats, setRevenueStats] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("day");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportTable, setExportTable] = useState("");
  const [exportType, setExportType] = useState("");
  const [exportPeriod, setExportPeriod] = useState("");
  const [exportFilter, setExportFilter] = useState("");

  const fetchOrderStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/api/order-stats?period=${selectedPeriod}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data && response.data.orderStats) {
        setOrderStats([
          {
            name: statusConfig["Đang xử lý"].text,
            orders: response.data.orderStats.processing,
          },
          {
            name: statusConfig["Đã xác nhận"].text,
            orders: response.data.orderStats.confirmed,
          },
          {
            name: statusConfig["Đang giao hàng"].text,
            orders: response.data.orderStats.shipping,
          },
          {
            name: statusConfig["Đã giao hàng"].text,
            orders: response.data.orderStats.delivered,
          },
          {
            name: statusConfig["Đã hủy"].text,
            orders: response.data.orderStats.canceled,
          },
        ]);
        setRevenueStats(response.data.revenueStats);
      } else {
        setOrderStats([]);
        setRevenueStats(null);
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy thống kê đơn hàng:", error);
      setError("Không thể tải dữ liệu đơn hàng.");
      setOrderStats([]);
      setRevenueStats(null);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchOrderStats();
  }, [fetchOrderStats, selectedPeriod]);

  // Hàm xuất Excel (chỉ xử lý đơn hàng và doanh thu)
  const exportToExcel = async () => {
    if (!exportTable) {
      alert("Chọn đúng bảng cần xuất.");
      return;
    }
    const token = localStorage.getItem("token");
    const wb = XLSX.utils.book_new();
    let ws;
    let sheetName = "";
    let fileName = "";

    try {
      if (exportTable === "order") {
        const response = await axios.get(
          `/api/order-stats?period=${exportPeriod}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.data) {
          alert("Không có dữ liệu đơn hàng để xuất.");
          return;
        }
        if (exportType === "summary") {
          let data;
          if (exportFilter !== "all") {
            data = [
              {
                "Trạng thái":
                  statusConfig[
                    exportFilter === "confirmed"
                      ? "Đã xác nhận"
                      : exportFilter === "shipping"
                      ? "Đang giao hàng"
                      : exportFilter === "delivered"
                      ? "Đã giao hàng"
                      : exportFilter === "canceled"
                      ? "Đã hủy"
                      : "Đang xử lý"
                  ].text,
                "Số lượng": response.data.orderStats[exportFilter],
              },
            ];
          } else {
            data = [
              {
                "Trạng thái": statusConfig["Đang xử lý"].text,
                "Số lượng": response.data.orderStats.processing,
              },
              {
                "Trạng thái": statusConfig["Đã xác nhận"].text,
                "Số lượng": response.data.orderStats.confirmed,
              },
              {
                "Trạng thái": statusConfig["Đang giao hàng"].text,
                "Số lượng": response.data.orderStats.shipping,
              },
              {
                "Trạng thái": statusConfig["Đã giao hàng"].text,
                "Số lượng": response.data.orderStats.delivered,
              },
              {
                "Trạng thái": statusConfig["Đã hủy"].text,
                "Số lượng": response.data.orderStats.canceled,
              },
            ];
          }
          ws = XLSX.utils.json_to_sheet(data);
          sheetName =
            exportFilter !== "all"
              ? `OrderStats_${exportFilter}_Summary`
              : "OrderStats_Summary";
          fileName = `${sheetName}_${exportPeriod}.xlsx`;
        } else if (exportType === "detailed") {
          const categorized = response.data.categorizedOrders;
          let allOrders = [];
          if (exportFilter !== "all") {
            if (exportFilter === "delivered") {
              allOrders = [
                ...(categorized["shipping"] || []),
                ...(categorized["delivered"] || []),
              ].map((order) => ({ ...order, exportStatus: "Đã giao" }));
            } else {
              allOrders = (categorized[exportFilter] || []).map((order) => ({
                ...order,
                exportStatus: order.orderStatus,
              }));
            }
          } else {
            Object.keys(categorized).forEach((key) => {
              allOrders = allOrders.concat(categorized[key]);
            });
          }
          const groupOrdersById = (orders) => {
            const orderMap = {};
            orders.forEach((order) => {
              const id = order.orderId;
              if (orderMap[id]) {
                orderMap[id].items = [...orderMap[id].items, ...order.items];
              } else {
                orderMap[id] = { ...order };
              }
              if (!orderMap[id].exportStatus) {
                orderMap[id].exportStatus = order.orderStatus;
              }
            });
            return Object.values(orderMap);
          };
          const groupedOrders = groupOrdersById(allOrders);
          const data = groupedOrders.map((order) => {
            const itemsStr = order.items
              .map((item) => `${item.name} (x${item.quantity})`)
              .join(", ");
            return {
              "Order ID": order.orderId,
              "Trạng thái": order.exportStatus,
              "User Name": order.userInfo?.fullName || "",
              "User Phone": order.userInfo?.phone || "",
              "Total Amount": order.totalAmount,
              Subtotal: order.subtotal,
              "Shipping Fee": order.shippingFee,
              "Payment Method": order.paymentMethod,
              "Payment Status": order.paymentStatus,
              "Order Date": order.formattedOrderDate,
              Items: itemsStr,
            };
          });
          ws = XLSX.utils.json_to_sheet(data);
          sheetName =
            exportFilter !== "all"
              ? `OrderStats_${exportFilter}_Detailed`
              : "OrderStats_Detailed";
          fileName = `${sheetName}_${exportPeriod}.xlsx`;
        }
      } else if (exportTable === "revenue") {
        const response = await axios.get(
          `/api/order-stats?period=${exportPeriod}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data && response.data.revenueStats) {
          const data = [
            {
              "Trạng thái": statusConfig["Đang xử lý"].text,
              "Doanh thu": response.data.revenueStats.processing,
            },
            {
              "Trạng thái": statusConfig["Đã xác nhận"].text,
              "Doanh thu": response.data.revenueStats.confirmed,
            },
            {
              "Trạng thái": statusConfig["Đang giao hàng"].text,
              "Doanh thu": response.data.revenueStats.shipping,
            },
            {
              "Trạng thái": statusConfig["Đã giao hàng"].text,
              "Doanh thu": response.data.revenueStats.delivered,
            },
          ];
          ws = XLSX.utils.json_to_sheet(data);
          sheetName = "RevenueStats";
          fileName = `${sheetName}_${exportPeriod}.xlsx`;
        } else {
          alert("Không có dữ liệu doanh thu để xuất.");
          return;
        }
      }

      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error("Lỗi khi xuất Excel:", err);
      alert("Đã xảy ra lỗi khi xuất Excel.");
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-3 text-center">📊 Trang quản lý </h1>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col xs={12} md={4}>
          <Form.Group controlId="selectPeriod">
            <Form.Label>Thống kê theo:</Form.Label>
            <Form.Control
              as="select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="day">Ngày</option>
              <option value="week">Tuần</option>
              <option value="month">Tháng</option>
              <option value="quarter">Quý</option>
              <option value="year">Năm</option>
              <option value="all">Toàn thời gian</option>
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col xs={12} md={3}>
          <Form.Group controlId="exportTable">
            <Form.Label>Chọn bảng xuất:</Form.Label>
            <Form.Control
              as="select"
              value={exportTable}
              onChange={(e) => {
                const value = e.target.value;
                setExportTable(value);
                setExportType("");
                setExportFilter("");
                setExportPeriod("");
                if (value === "revenue") {
                  setExportType("summary");
                }
              }}
            >
              <option value="">-- Chọn bảng --</option>
              <option value="order">Trạng thái đơn hàng</option>
              <option value="revenue">Tổng Danh thu tam tính</option>
            </Form.Control>
          </Form.Group>
        </Col>

        {exportTable === "order" && (
          <>
            <Col xs={12} md={2}>
              <Form.Group controlId="exportType">
                <Form.Label>Kiểu xuất:</Form.Label>
                <Form.Control
                  as="select"
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value)}
                >
                  <option value="">-- Chọn kiểu xuất --</option>
                  <option value="summary">Tóm tắt</option>
                  <option value="detailed">Chi tiết</option>
                </Form.Control>
              </Form.Group>
            </Col>
            <Col xs={12} md={2}>
              <Form.Group controlId="exportFilter">
                <Form.Label>Chọn lọc:</Form.Label>
                <Form.Control
                  as="select"
                  value={exportFilter}
                  onChange={(e) => setExportFilter(e.target.value)}
                  disabled={!exportType}
                >
                  <option value="">-- Chọn lọc --</option>
                  {exportFilterOptions.order.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col xs={12} md={2}>
              <Form.Group controlId="exportPeriod">
                <Form.Label>Xuất theo:</Form.Label>
                <Form.Control
                  as="select"
                  value={exportPeriod}
                  onChange={(e) => setExportPeriod(e.target.value)}
                  disabled={!exportFilter}
                >
                  <option value="">-- Chọn thời gian --</option>
                  <option value="day">Ngày</option>
                  <option value="week">Tuần</option>
                  <option value="month">Tháng</option>
                  <option value="quarter">Quý</option>
                  <option value="year">Năm</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </>
        )}

        {exportTable === "revenue" && (
          <Col xs={12} md={2}>
            <Form.Group controlId="exportPeriod">
              <Form.Label>Xuất theo:</Form.Label>
              <Form.Control
                as="select"
                value={exportPeriod}
                onChange={(e) => setExportPeriod(e.target.value)}
              >
                <option value="">-- Chọn thời gian --</option>
                <option value="day">Ngày</option>
                <option value="week">Tuần</option>
                <option value="month">Tháng</option>
                <option value="quarter">Quý</option>
                <option value="year">Năm</option>
              </Form.Control>
            </Form.Group>
          </Col>
        )}

        <Col xs={12} md={3} className="d-flex align-items-end">
          <Button
            variant="success"
            onClick={exportToExcel}
            disabled={
              !exportTable ||
              (exportTable === "order" &&
                (!exportType || !exportFilter || !exportPeriod)) ||
              (exportTable === "revenue" && !exportPeriod)
            }
          >
            Xuất Excel
          </Button>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <p className="text-danger">{error}</p>
          </Col>
        </Row>
      )}

      {/* Hiển thị biểu đồ và bảng chi tiết */}
      <Row className="mb-4">
        <Col xs={12} md={6}>
          <Card>
            <Card.Header>
              <h2>📦 Trạng thái đơn hàng ({selectedPeriod})</h2>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <p>Đang tải...</p>
              ) : orderStats.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={orderStats}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#4F46E5" />
                    </BarChart>
                  </ResponsiveContainer>
                  <Table striped bordered hover size="sm" className="mt-3">
                    <thead>
                      <tr>
                        <th>Trạng thái</th>
                        <th>Số lượng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderStats.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{item.orders}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              ) : (
                <p>Không có dữ liệu đơn hàng.</p>
              )}
            </Card.Body>
            <Card.Footer className="text-center">
              <Link to="/quan-ly-don-hang">
                <Button variant="primary btn-secondary">
                  Quản lý đơn hàng
                </Button>
              </Link>
            </Card.Footer>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card>
            <Card.Header>
              <h2>💰 Danh thu tạm tính ({selectedPeriod})</h2>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <p>Đang tải...</p>
              ) : revenueStats ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        {
                          name: statusConfig["Đang xử lý"].text,
                          revenue: revenueStats.processing,
                        },
                        {
                          name: statusConfig["Đã xác nhận"].text,
                          revenue: revenueStats.confirmed,
                        },
                        {
                          name: statusConfig["Đang giao hàng"].text,
                          revenue: revenueStats.shipping,
                        },
                        {
                          name: statusConfig["Đã giao hàng"].text,
                          revenue: revenueStats.delivered,
                        },
                      ]}
                      margin={{ right: 30, left: 30 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={formatter} />
                      <Tooltip formatter={formatter} />
                      <Bar dataKey="revenue" fill="#FF6F91" />
                    </BarChart>
                  </ResponsiveContainer>
                  <Table striped bordered hover size="sm" className="mt-3">
                    <thead>
                      <tr>
                        <th>Trạng thái</th>
                        <th>Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          name: statusConfig["Đang xử lý"].text,
                          revenue: revenueStats.processing,
                        },
                        {
                          name: statusConfig["Đã xác nhận"].text,
                          revenue: revenueStats.confirmed,
                        },
                        {
                          name: statusConfig["Đang giao hàng"].text,
                          revenue: revenueStats.shipping,
                        },
                        {
                          name: statusConfig["Đã giao hàng"].text,
                          revenue: revenueStats.delivered,
                        },
                      ].map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{formatter(item.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              ) : (
                <p>Không có dữ liệu doanh thu.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardAccountant;
