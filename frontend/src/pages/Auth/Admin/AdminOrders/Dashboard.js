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
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatter } from "../../../../utils/fomater";
import * as XLSX from "xlsx";

// Cấu hình trạng thái dùng cho đơn hàng và doanh thu
const statusConfig = {
  "Đang xử lý": { color: "warning", text: "Đang xử lý" },
  "Đã xác nhận": { color: "info", text: "Đã xác nhận" },
  "Đang giao hàng": { color: "primary", text: "Đang giao hàng" },
  "Đã giao hàng": { color: "success", text: "Đã giao hàng" },
  "Đã hủy": { color: "danger", text: "Đã hủy" },
};

// Định nghĩa các lựa chọn lọc cho từng bảng xuất Excel
const exportFilterOptions = {
  order: [
    { value: "all", label: "Tất cả" },
    { value: "processing", label: statusConfig["Đang xử lý"].text },
    { value: "confirmed", label: statusConfig["Đã xác nhận"].text },
    { value: "delivered", label: statusConfig["Đã giao hàng"].text },
    { value: "canceled", label: statusConfig["Đã hủy"].text },
  ],
  sales: [
    { value: "all", label: "Tất cả" },
    { value: "inventory", label: "Tổng hàng hóa" },
    { value: "sold", label: "Đã bán" },
    { value: "bestSelling", label: "Bán chạy" },
    { value: "top20BestSelling", label: "20 sản phẩm bán chạy nhất" },
  ],
};

const Dashboard = () => {
  // State hiển thị dữ liệu dashboard
  const [orderStats, setOrderStats] = useState([]);
  const [revenueStats, setRevenueStats] = useState(null);
  const [salesStats, setSalesStats] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("day");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Các state cho chức năng xuất Excel
  const [exportTable, setExportTable] = useState("");
  const [exportType, setExportType] = useState("");
  const [exportPeriod, setExportPeriod] = useState("");
  const [exportFilter, setExportFilter] = useState("");

  // Hàm lấy thống kê đơn hàng (bao gồm doanh thu)
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

  // Hàm lấy thống kê bán hàng (sản phẩm đã bán, tồn kho, bán chạy)
  const fetchSalesStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/api/sales-stats?period=${selectedPeriod}`,
        { headers: { Authorization: `Bearer ${token}` } }
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

  // Gọi API khi selectedPeriod thay đổi
  useEffect(() => {
    fetchOrderStats();
    fetchSalesStats();
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
  const soldFromDelivered =
    orderStats.find((item) => item.name === statusConfig["Đã giao hàng"].text)
      ?.orders || 0;

  // Giả sử danh sách sản phẩm lấy từ salesStats.bestSelling (hoặc mảng tương tự)
  const products =
    salesStats && salesStats.bestSelling ? salesStats.bestSelling : [];

  // Tính số lượng bán ra và trung bình
  const soldArray = products.map(
    (product) => product.stock - product.remainingStock
  );
  const averageSold =
    soldArray.length > 0
      ? soldArray.reduce((a, b) => a + b, 0) / soldArray.length
      : 0;

  // Tính số sản phẩm bán chạy theo thuật toán:
  // sold nằm trong khoảng [10, 100] và > 1.2 * averageSold
  const bestSellingCount = products.filter((product) => {
    const sold = product.stock - product.remainingStock;
    return sold >= 10 && sold <= 100 && sold > averageSold * 1.2;
  }).length;

  // Biểu đồ "Quản lý sản phẩm"
  const chartData = [
    { metric: "Tổng kho", value: totalStock },
    { metric: "Còn lại", value: totalRemaining },
    { metric: "Đã bán", value: soldFromDelivered },
    { metric: "Bán chạy", value: bestSellingCount },
  ];
  const barColors = ["#8884d8", "#82ca9d", "#4F46E5", "#FF6F91"];

  // Dataset cho bảng "Tổng Danh thu tam tính"
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

  // Hàm xuất Excel cho "Đã bán" (chi tiết đơn hàng)
  const exportSalesSoldDetailed = async (period, token) => {
    const response = await axios.get(`/api/order-stats?period=${period}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.data || !response.data.categorizedOrders) {
      alert("Không có dữ liệu đơn hàng để xuất.");
      return null;
    }
    const categorized = response.data.categorizedOrders;
    const deliveredOrders = categorized["delivered"] || [];
    if (!deliveredOrders.length) {
      alert("Không có dữ liệu đơn hàng đã giao hàng để xuất.");
      return null;
    }
    const detailedItems = [];
    deliveredOrders.forEach((order) => {
      order.items.forEach((item) => {
        detailedItems.push({
          "Order ID": order.orderId,
          "Order Date": order.formattedOrderDate,
          "Customer Name": order.userInfo?.fullName || "",
          "Product ID": item.productId || item._id || "",
          "Product Name": item.name,
          Quantity: item.quantity,
          "Unit Price": item.price || "",
        });
      });
    });
    const ws = XLSX.utils.json_to_sheet(detailedItems);
    const sheetName = "SalesStats_Sold_Detailed";
    const fileName = `${sheetName}_${period}.xlsx`;
    return { ws, sheetName, fileName };
  };

  // Hàm xuất Excel (xuất file Excel chi tiết)
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
              ? exportFilter === "delivered"
                ? "OrderStats_Delivered_Detailed"
                : `OrderStats_${exportFilter}_Detailed`
              : "OrderStats_Detailed";
          fileName = `${sheetName}_${exportPeriod}.xlsx`;
        }
      } else if (exportTable === "sales") {
        if (exportType === "summary") {
          const periodParam = exportFilter === "sold" ? exportPeriod : "all";
          if (exportFilter === "inventory") {
            const response = await axios.get(
              `/api/sales-stats?period=${periodParam}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.data) {
              alert("Không có dữ liệu thống kê bán hàng để xuất.");
              return;
            }
            const salesData = response.data;
            const data = [
              {
                "Chỉ số": "Tổng kho",
                "Giá trị": salesData.totalInventory.totalStock,
              },
              {
                "Chỉ số": "Đã bán",
                "Giá trị": salesData.totalInventory.totalSold,
              },
            ];
            ws = XLSX.utils.json_to_sheet(data);
            sheetName = "SalesStats_Inventory_Summary";
            fileName = `${sheetName}_${periodParam}.xlsx`;
          } else if (exportFilter === "sold") {
            const result = await exportSalesSoldDetailed(exportPeriod, token);
            if (!result) return;
            ws = result.ws;
            sheetName = result.sheetName;
            fileName = result.fileName;
          } else if (exportFilter === "bestSelling") {
            const bestSellingProducts = products.filter((product) => {
              const sold = product.stock - product.remainingStock;
              return sold >= 10 && sold <= 100 && sold > averageSold * 1.2;
            });
            const data = [
              {
                "Sản phẩm bán chạy": bestSellingProducts.length,
              },
            ];
            ws = XLSX.utils.json_to_sheet(data);
            sheetName = "SalesStats_BestSelling_Summary";
            fileName = `${sheetName}_${periodParam}.xlsx`;
          } else if (exportFilter === "top20BestSelling") {
            const productsWithPercent = products.map((product) => {
              const sold = product.stock - product.remainingStock;
              const percentSold =
                product.stock > 0 ? (sold / product.stock) * 100 : 0;
              return { ...product, percentSold };
            });
            const sortedProducts = productsWithPercent.sort(
              (a, b) => b.percentSold - a.percentSold
            );
            const top20 = sortedProducts.slice(0, 20);
            const data = top20.map((product) => {
              const sold = product.stock - product.remainingStock;
              return {
                "Product ID": product._id,
                "Product Name": product.name,
                Category: product.category?.name || "-",
                Brand: product.brand || "-",
                Stock: product.stock,
                Remaining: product.remainingStock,
                Sold: sold,
                "% Sold":
                  product.stock > 0 ? formatPercent(product.percentSold) : "0%",
              };
            });
            ws = XLSX.utils.json_to_sheet(data);
            sheetName = "Top20_BestSelling_Detailed";
            fileName = `${sheetName}_${exportPeriod || "all"}.xlsx`;
          } else {
            const response = await axios.get(
              `/api/sales-stats?period=${periodParam}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.data) {
              alert("Không có dữ liệu thống kê bán hàng để xuất.");
              return;
            }
            const salesData = response.data;
            const data = [
              {
                "Chỉ số": "Tổng kho",
                "Giá trị": salesData.totalInventory.totalStock,
              },
              {
                "Chỉ số": "Đã bán",
                "Giá trị": salesData.totalInventory.totalSold,
              },
            ];
            ws = XLSX.utils.json_to_sheet(data);
            sheetName = "SalesStats_Summary";
            fileName = `${sheetName}_${periodParam}.xlsx`;
          }
        } else if (exportType === "detailed") {
          if (exportFilter === "sold") {
            const result = await exportSalesSoldDetailed(exportPeriod, token);
            if (!result) return;
            ws = result.ws;
            sheetName = result.sheetName;
            fileName = result.fileName;
          } else if (exportFilter === "bestSelling") {
            const bestSellingProducts = products.filter((product) => {
              const sold = product.stock - product.remainingStock;
              return sold >= 10 && sold <= 100 && sold > averageSold * 1.2;
            });
            const data = [
              {
                "Sản phẩm bán chạy": bestSellingProducts.length,
              },
            ];
            ws = XLSX.utils.json_to_sheet(data);
            sheetName = "SalesStats_BestSelling_Detailed";
            fileName = `${sheetName}_${exportPeriod || "all"}.xlsx`;
          } else if (exportFilter === "top20BestSelling") {
            const productsWithPercent = products.map((product) => {
              const sold = product.stock - product.remainingStock;
              const percentSold =
                product.stock > 0 ? (sold / product.stock) * 100 : 0;
              return { ...product, percentSold };
            });
            const sortedProducts = productsWithPercent.sort(
              (a, b) => b.percentSold - a.percentSold
            );
            const top20 = sortedProducts.slice(0, 20);
            const data = top20.map((product) => {
              const sold = product.stock - product.remainingStock;
              return {
                "Product ID": product._id,
                "Product Name": product.name,
                Category: product.category?.name || "-",
                Brand: product.brand || "-",
                Stock: product.stock,
                Remaining: product.remainingStock,
                Sold: sold,
                "% Sold":
                  product.stock > 0 ? formatPercent(product.percentSold) : "0%",
              };
            });
            ws = XLSX.utils.json_to_sheet(data);
            sheetName = "Top20_BestSelling_Detailed";
            fileName = `${sheetName}_${exportPeriod || "all"}.xlsx`;
          } else {
            const productResponse = await axios.get(`/api/products`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const detailedProducts = productResponse.data.products || [];
            if (!detailedProducts.length) {
              alert("Không có dữ liệu sản phẩm để xuất.");
              return;
            }
            const data = detailedProducts.map((product) => ({
              "Product ID": product._id,
              "Product Name": product.name,
              "Category Name": product.category?.name || "",
              "Product Type": product.category?.type || "",
              Brand: product.brand,
              "Original Price": product.originalPrice,
              "Discount %": product.discountPercentage,
              "Price After Discount": product.priceAfterDiscount,
              Stock: product.stock,
              "Remaining Stock": product.remainingStock,
            }));
            ws = XLSX.utils.json_to_sheet(data);
            sheetName = "SalesStats_Detailed";
            fileName = `${sheetName}_all.xlsx`;
          }
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

  // Hàm định dạng phần trăm bán ra
  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Hàm hiển thị bảng Top 20 sản phẩm bán ra cao nhất
  const renderTop20BestSellingTable = () => {
    if (!products || products.length === 0) return null;
    const productsWithPercent = products.map((product) => {
      const sold = product.stock - product.remainingStock;
      const percentSold = product.stock > 0 ? (sold / product.stock) * 100 : 0;
      return { ...product, percentSold };
    });
    const top20 = productsWithPercent
      .sort((a, b) => b.percentSold - a.percentSold)
      .slice(0, 20);
    return (
      <Card >
        <Card.Header>
          <h4>20 Sản phẩm bán ra cao nhất</h4>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                {/* <th>Product ID</th> */}
                <th>Tên sản phẩm</th>
                <th>Category</th>
                {/* <th>Brand</th>
                <th>Stock</th>
                <th>Remaining</th> */}
                <th>Sold</th>
                <th>% Sold</th>
              </tr>
            </thead>
            <tbody>
              {top20.map((product) => {
                const sold = product.stock - product.remainingStock;
                return (
                  <tr key={product._id}>
                    {/* <td>{product._id}</td> */}
                    <td className="truncate">{product.name}</td>
                    {/* <td>{product.category?.name || "-"}</td>
                    <td>{product.brand || "-"}</td>
                    <td>{product.stock}</td> */}
                    <td>{product.remainingStock}</td>
                    <td>{sold}</td>
                    <td>{formatPercent(product.percentSold)}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-3 text-center">📊 Trang quản lý </h1>
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
              <option value="sales">Quản lý sản phẩm</option>
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

        {exportTable === "sales" && (
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
                  {exportFilterOptions.sales.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            {(exportFilter === "sold" ||
              exportFilter === "bestSelling" ||
              exportFilter === "top20BestSelling") && (
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
              (exportTable === "sales" &&
                (!exportType ||
                  !exportFilter ||
                  ((exportFilter === "sold" ||
                    exportFilter === "bestSelling" ||
                    exportFilter === "top20BestSelling") &&
                    !exportPeriod))) ||
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

      {/* Biểu đồ và bảng chi tiết hiển thị dưới mỗi biểu đồ */}
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
              <Link to="/admin/quan-ly-don-hang">
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
              <h2>📊 Quản lý sản phẩm ({selectedPeriod})</h2>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <p>Đang tải...</p>
              ) : salesStats ? (
                <>
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
                  <Table striped bordered hover size="sm" className="mt-3">
                    <thead>
                      <tr>
                        <th>Chỉ số</th>
                        <th>Giá trị</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.map((item, index) => (
                        <tr key={index}>
                          <td>{item.metric}</td>
                          <td>{item.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              ) : (
                <p>Không có dữ liệu sản phẩm.</p>
              )}
            </Card.Body>
            <Card.Footer className="text-center">
              <Link to="/admin/add-product">
                <Button variant="secondary" className="me-4 btn-secondary">
                  Đăng sản phẩm
                </Button>
              </Link>
              <Link to="/admin/edit-product">
                <Button variant="primary btn-secondary">
                  Quản lý sản phẩm
                </Button>
              </Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4 ">
        <Col xs={12} md={6}>
          <Card>
            <Card.Header>
              <h2>💰 Danh thu tam tính ({selectedPeriod})</h2>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <p>Đang tải...</p>
              ) : revenueChartData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={revenueChartData}
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
                      {revenueChartData.map((item, index) => (
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
            <Card.Footer className="text-center">
              <Link to="/admin/quan-ly-don-hang">
                <Button variant="primary btn-secondary">
                  Quản lý đơn hàng
                </Button>
              </Link>
            </Card.Footer>
          </Card>
        </Col>

        <Col className="product_top_20" xs={12} md={6}>
          {renderTop20BestSellingTable()}
        </Col>
      </Row>

      <style>{`
    
   
      .truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 50px;
      }
    `}</style>
    </Container>
  );
};

export default Dashboard;
