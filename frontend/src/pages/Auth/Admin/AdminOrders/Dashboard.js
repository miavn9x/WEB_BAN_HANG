import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Container, Row, Col, Form, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatter } from "../../../../utils/fomater";
import * as XLSX from "xlsx";

// Cấu hình trạng thái (dùng cho thống kê đơn hàng)
const statusConfig = {
  "Đang xử lý": { color: "warning", text: "Đang xử lý" },
  "Đã xác nhận": { color: "info", text: "Đã xác nhận" },
  "Đang giao hàng": { color: "primary", text: "Đang giao hàng" },
  "Đã giao hàng": { color: "success", text: "Đã giao hàng" },
  "Đã hủy": { color: "danger", text: "Đã hủy" },
};

const Dashboard = () => {
  // Dữ liệu hiển thị của dashboard
  const [orderStats, setOrderStats] = useState([]);
  const [revenueStats, setRevenueStats] = useState(null);
  const [salesStats, setSalesStats] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("day");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State cho chức năng xuất Excel
  const [exportTable, setExportTable] = useState(""); // Các giá trị: "order", "sales", "revenue"
  const [exportPeriod, setExportPeriod] = useState("day");

  // Hàm lấy thống kê đơn hàng (bao gồm cả doanh thu)
  const fetchOrderStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/api/order-stats?period=${selectedPeriod}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
        // Lưu doanh thu cho 4 trạng thái (không tính "Đã hủy")
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

  // Hàm lấy thống kê bán hàng (sản phẩm đã bán, tồn kho, bán chạy)
  const fetchSalesStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/api/sales-stats?period=${selectedPeriod}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSalesStats(response.data);
    } catch (error) {
      console.error("❌ Lỗi khi lấy thống kê bán hàng:", error);
      setError("Không thể tải dữ liệu thống kê bán hàng.");
      setSalesStats(null);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  // Gọi API mỗi khi selectedPeriod thay đổi
  useEffect(() => {
    fetchOrderStats();
    fetchSalesStats();
    // Không đồng bộ exportPeriod với selectedPeriod, exportPeriod độc lập
  }, [fetchOrderStats, fetchSalesStats, selectedPeriod]);

  // Tính số liệu cho bảng "Quản lý sản phẩm"
  const totalStock =
    salesStats && salesStats.totalInventory
      ? salesStats.totalInventory.totalStock
      : 0;
  const totalRemaining =
    salesStats && salesStats.totalInventory
      ? salesStats.totalInventory.totalRemaining
      : 0;
  const totalSoldCalculated = totalStock - totalRemaining;
  const bestSellingValue =
    salesStats && salesStats.bestSelling && salesStats.bestSelling.length > 0
      ? salesStats.bestSelling.reduce((max, cur) => {
          const sold = cur.stock - cur.remainingStock;
          return sold > max ? sold : max;
        }, 0)
      : 0;
  const chartData = [
    { metric: "Tổng kho", value: totalStock },
    { metric: "Còn lại", value: totalRemaining },
    { metric: "Đã bán", value: totalSoldCalculated },
    { metric: "Bán chạy", value: bestSellingValue },
  ];
  const barColors = ["#8884d8", "#82ca9d", "#4F46E5", "#FF6F91"];

  // Tạo dataset cho bảng "Tổng Danh thu tam tính"
  const revenueChartData = revenueStats
    ? [
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
      ]
    : [];

  // Hàm xuất dữ liệu ra file Excel theo bảng đã chọn và thời gian đã chọn (exportPeriod)
  const exportToExcel = async () => {
    if (!exportTable) {
      alert("Vui lòng chọn bảng cần xuất.");
      return;
    }

    const token = localStorage.getItem("token");
    const wb = XLSX.utils.book_new();
    let ws;
    let sheetName = "";
    let fileName = "";

    try {
      if (exportTable === "order") {
        // Xuất bảng Trạng thái đơn hàng (xuất 5 trạng thái)
        const response = await axios.get(
          `/api/order-stats?period=${exportPeriod}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data && response.data.orderStats) {
          const data = [
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
          ws = XLSX.utils.json_to_sheet(data);
          sheetName = "OrderStats";
          fileName = `OrderStats_${exportPeriod}.xlsx`;
        } else {
          alert("Không có dữ liệu đơn hàng để xuất.");
          return;
        }
      } else if (exportTable === "revenue") {
        // Xuất bảng Tổng Danh thu tam tính (4 trạng thái, không bao gồm "Đã hủy")
        const response = await axios.get(
          `/api/order-stats?period=${exportPeriod}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
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
          fileName = `RevenueStats_${exportPeriod}.xlsx`;
        } else {
          alert("Không có dữ liệu doanh thu để xuất.");
          return;
        }
      } else if (exportTable === "sales") {
        // Xuất bảng Quản lý sản phẩm dựa trên dữ liệu thống kê bán hàng
        const response = await axios.get(
          `/api/sales-stats?period=${exportPeriod}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data) {
          const salesData = response.data;
          const totalStock =
            salesData.totalInventory && salesData.totalInventory.totalStock
              ? salesData.totalInventory.totalStock
              : 0;
          const totalRemaining =
            salesData.totalInventory && salesData.totalInventory.totalRemaining
              ? salesData.totalInventory.totalRemaining
              : 0;
          const totalSoldCalculated = totalStock - totalRemaining;
          const bestSellingValue =
            salesData.bestSelling && salesData.bestSelling.length > 0
              ? salesData.bestSelling.reduce((max, cur) => {
                  const sold = cur.stock - cur.remainingStock;
                  return sold > max ? sold : max;
                }, 0)
              : 0;
          const data = [
            { "Chỉ số": "Tổng kho", "Giá trị": totalStock },
            { "Chỉ số": "Còn lại", "Giá trị": totalRemaining },
            { "Chỉ số": "Đã bán", "Giá trị": totalSoldCalculated },
            { "Chỉ số": "Bán chạy", "Giá trị": bestSellingValue },
          ];
          ws = XLSX.utils.json_to_sheet(data);
          sheetName = "SalesStats";
          fileName = `SalesStats_${exportPeriod}.xlsx`;
        } else {
          alert("Không có dữ liệu thống kê bán hàng để xuất.");
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
          <h1 className="mb-3 text-center">📊 Bảng điều khiển quản lý</h1>
        </Col>
      </Row>

      {/* Bộ lọc thời gian hiển thị dashboard */}
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

      {/* Phần điều khiển xuất Excel */}
      <Row className="mb-4">
        <Col xs={12} md={3}>
          <Form.Group controlId="exportTable">
            <Form.Label>Chọn bảng xuất:</Form.Label>
            <Form.Control
              as="select"
              value={exportTable}
              onChange={(e) => setExportTable(e.target.value)}
            >
              <option value="">-- Chọn bảng --</option>
              <option value="order">Trạng thái đơn hàng</option>
              <option value="sales">Quản lý sản phẩm</option>
              <option value="revenue">Tổng Danh thu tam tính</option>
            </Form.Control>
          </Form.Group>
        </Col>
        <Col xs={12} md={3}>
          <Form.Group controlId="exportPeriod">
            <Form.Label>Xuất theo:</Form.Label>
            <Form.Control
              as="select"
              value={exportPeriod}
              onChange={(e) => setExportPeriod(e.target.value)}
              disabled={!exportTable} // Chỉ được chọn khi đã có bảng xuất
            >
              <option value="day">Ngày</option>
              <option value="week">Tuần</option>
              <option value="month">Tháng</option>
              <option value="quarter">Quý</option>
              <option value="year">Năm</option>
            </Form.Control>
          </Form.Group>
        </Col>
        <Col xs={12} md={3} className="d-flex align-items-end">
          <Button
            variant="success"
            onClick={exportToExcel}
            disabled={!exportTable}
          >
            Xuất Excel
          </Button>
        </Col>
      </Row>

      {/* Hiển thị lỗi nếu có */}
      {error && (
        <Row className="mb-4">
          <Col>
            <p className="text-danger">{error}</p>
          </Col>
        </Row>
      )}

      {/* Hàng đầu tiên: Trạng thái đơn hàng và Quản lý sản phẩm */}
      <Row className="mb-4">
        {/* Card thống kê đơn hàng */}
        <Col xs={12} md={6}>
          <Card>
            <Card.Header>
              <h2>📦 Trạng thái đơn hàng ({selectedPeriod})</h2>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <p>Đang tải...</p>
              ) : orderStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={orderStats}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p>Không có dữ liệu đơn hàng.</p>
              )}
            </Card.Body>
            <Card.Footer className="text-center">
              <Link to="/admin/quan-ly-don-hang">
                <Button variant="primary">Quản lý đơn hàng</Button>
              </Link>
            </Card.Footer>
          </Card>
        </Col>

        {/* Card thống kê bán hàng / sản phẩm */}
        <Col xs={12} md={6}>
          <Card>
            <Card.Header>
              <h2>📊 Quản lý sản phẩm ({selectedPeriod})</h2>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <p>Đang tải...</p>
              ) : salesStats ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value">
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={barColors[index % barColors.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p>Không có dữ liệu sản phẩm.</p>
              )}
            </Card.Body>
            <Card.Footer className="text-center">
              <Link to="/admin/add-product">
                <Button variant="secondary" className="me-2">
                  Đăng sản phẩm
                </Button>
              </Link>
              <Link to="/admin/edit-product">
                <Button variant="primary">Quản lý sản phẩm</Button>
              </Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Hàng thứ hai: Doanh thu theo trạng thái */}
      <Row className="mb-4">
        <Col xs={12} md={6}>
          <Card>
            <Card.Header>
              <h2>💰 Tổng Danh thu tam tính ({selectedPeriod})</h2>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <p>Đang tải...</p>
              ) : revenueChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={revenueChartData}
                    margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={formatter} />
                    <Tooltip formatter={formatter} />
                    <Bar dataKey="revenue" fill="#FF6F91" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p>Không có dữ liệu doanh thu.</p>
              )}
            </Card.Body>
            <Card.Footer className="text-center">
              <Link to="/admin/quan-ly-don-hang">
                <Button variant="primary">Quản lý đơn hàng</Button>
              </Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
