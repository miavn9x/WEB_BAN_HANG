import React, { useState, useEffect, useCallback } from "react";
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
import * as XLSX from "xlsx";

// Lựa chọn lọc cho xuất Excel cho bảng "sales" (Quản lý sản phẩm)
const exportFilterOptions = {
  sales: [
    { value: "all", label: "Tất cả" },
    { value: "inventory", label: "Tổng hàng hóa" },
    { value: "sold", label: "Đã bán" },
    { value: "bestSelling", label: "Bán chạy" },
    { value: "top20BestSelling", label: "20 sản phẩm bán chạy nhất" },
  ],
};

const Dashboardwarehouse = () => {
  // State thống kê bán hàng (sản phẩm)
  const [salesStats, setSalesStats] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("day");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Các state xuất Excel (chỉ dành cho bảng "sales")
  const [exportTable, setExportTable] = useState("sales");
  const [exportType, setExportType] = useState("");
  const [exportPeriod, setExportPeriod] = useState("");
  const [exportFilter, setExportFilter] = useState("");

  // State sản phẩm bán chạy (được lấy từ API thống kê)
  const [products, setProducts] = useState([]);

  // Hàm định dạng phần trăm bán ra
  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Hàm xuất Excel cho "Đã bán" chi tiết (sử dụng cho exportType "detailed" nếu chọn filter "sold")
  const exportSalesSoldDetailed = async (period, token) => {
    const response = await axios.get(`/api/sales-stats?period=${period}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.data || !response.data.detailedSold) {
      alert("Không có dữ liệu thống kê bán hàng để xuất.");
      return null;
    }
    const detailedItems = response.data.detailedSold; // Giả sử đây là mảng dữ liệu chi tiết
    const ws = XLSX.utils.json_to_sheet(detailedItems);
    const sheetName = "SalesStats_Sold_Detailed";
    const fileName = `${sheetName}_${period}.xlsx`;
    return { ws, sheetName, fileName };
  };

  // Hàm xuất Excel cho bảng thống kê sản phẩm (chỉ dành cho exportTable === "sales")
  const exportToExcel = async () => {
    if (!exportTable || exportTable !== "sales") {
      alert("Chọn bảng xuất là 'Quản lý sản phẩm'");
      return;
    }
    const token = localStorage.getItem("token");
    const wb = XLSX.utils.book_new();
    let ws;
    let sheetName = "";
    let fileName = "";
    try {
      if (exportType === "summary") {
        // Xuất dữ liệu tóm tắt (summary) dựa theo filter
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
          const soldArray = products.map(
            (product) => product.stock - product.remainingStock
          );
          const averageSold =
            soldArray.length > 0
              ? soldArray.reduce((a, b) => a + b, 0) / soldArray.length
              : 0;
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
          // Mặc định xuất dữ liệu summary
          const periodParam = exportFilter === "sold" ? exportPeriod : "all";
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
        // Xuất dữ liệu chi tiết
        if (exportFilter === "sold") {
          const result = await exportSalesSoldDetailed(exportPeriod, token);
          if (!result) return;
          ws = result.ws;
          sheetName = result.sheetName;
          fileName = result.fileName;
        } else if (exportFilter === "inventory" || exportFilter === "all") {
          // Lấy **tất cả chi tiết sản phẩm** theo Id từ API (ví dụ: /api/products)
          const response = await axios.get(`/api/products`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.data) {
            alert("Không có dữ liệu sản phẩm để xuất.");
            return;
          }
          const data = response.data.map((product) => {
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
                product.stock > 0
                  ? formatPercent((sold / product.stock) * 100)
                  : "0%",
            };
          });
          ws = XLSX.utils.json_to_sheet(data);
          sheetName = "Inventory_Details";
          fileName = `${sheetName}_${selectedPeriod}.xlsx`;
        } else if (
          exportFilter === "bestSelling" ||
          exportFilter === "top20BestSelling"
        ) {
          // Xuất chi tiết sản phẩm bán chạy từ state products
          // Lọc theo tiêu chí bán chạy (có thể dùng luôn logic của summary)
          const soldArray = products.map(
            (product) => product.stock - product.remainingStock
          );
          const averageSold =
            soldArray.length > 0
              ? soldArray.reduce((a, b) => a + b, 0) / soldArray.length
              : 0;
          const detailedProducts = products.filter((product) => {
            const sold = product.stock - product.remainingStock;
            return sold >= 10 && sold <= 100 && sold > averageSold * 1.2;
          });
          let data = [];
          if (exportFilter === "top20BestSelling") {
            const productsWithPercent = detailedProducts.map((product) => {
              const sold = product.stock - product.remainingStock;
              const percentSold =
                product.stock > 0 ? (sold / product.stock) * 100 : 0;
              return { ...product, percentSold };
            });
            const sortedProducts = productsWithPercent.sort(
              (a, b) => b.percentSold - a.percentSold
            );
            const top20 = sortedProducts.slice(0, 20);
            data = top20.map((product) => {
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
            sheetName = "Top20_BestSelling_Details";
            fileName = `${sheetName}_${exportPeriod || "all"}.xlsx`;
          } else {
            data = detailedProducts.map((product) => {
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
                  product.stock > 0
                    ? formatPercent((sold / product.stock) * 100)
                    : "0%",
              };
            });
            sheetName = "BestSelling_Details";
            fileName = `${sheetName}_${selectedPeriod}.xlsx`;
          }
          ws = XLSX.utils.json_to_sheet(data);
        }
      }

      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error("Lỗi khi xuất Excel:", err);
      alert("Đã xảy ra lỗi khi xuất Excel.");
    }
  };

  // Gọi API thống kê bán hàng và cập nhật state
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
      // Giả sử response.data.bestSelling chứa danh sách sản phẩm bán chạy
      if (response.data && response.data.bestSelling) {
        setProducts(response.data.bestSelling);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy thống kê bán hàng:", error);
      setError("Không thể tải dữ liệu thống kê bán hàng.");
      setSalesStats(null);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchSalesStats();
  }, [fetchSalesStats, selectedPeriod]);

  // Tính số liệu cho bảng "Quản lý sản phẩm"
  const totalStock =
    salesStats && salesStats.totalInventory
      ? salesStats.totalInventory.totalStock
      : 0;
  const totalRemaining =
    salesStats && salesStats.totalInventory
      ? salesStats.totalInventory.totalRemaining
      : 0;
  const soldArray = products.map(
    (product) => product.stock - product.remainingStock
  );
  const averageSold =
    soldArray.length > 0
      ? soldArray.reduce((a, b) => a + b, 0) / soldArray.length
      : 0;
  const bestSellingCount = products.filter((product) => {
    const sold = product.stock - product.remainingStock;
    return sold >= 10 && sold <= 100 && sold > averageSold * 1.2;
  }).length;

  // Biểu đồ "Quản lý sản phẩm"
  const chartData = [
    { metric: "Tổng kho", value: totalStock },
    { metric: "Còn lại", value: totalRemaining },
    { metric: "Bán chạy", value: bestSellingCount },
  ];
  const barColors = ["#8884d8", "#82ca9d", "#FF6F91"];

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
      <Card>
        <Card.Header>
          <h4>20 Sản phẩm bán ra cao nhất</h4>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Tên sản phẩm</th>
                <th>Sold</th>
                <th>% Sold</th>
              </tr>
            </thead>
            <tbody>
              {top20.map((product) => {
                const sold = product.stock - product.remainingStock;
                return (
                  <tr key={product._id}>
                    <td className="truncate">{product.name}</td>
                    <td>{sold}</td>
                    <td>
                      {formatPercent(
                        product.stock > 0 ? (sold / product.stock) * 100 : 0
                      )}
                    </td>
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
          <h1 className="mb-3 text-center">📊 Trang quản lý sản phẩm</h1>
        </Col>
      </Row>

      {/* Bộ lọc thời gian */}
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

      {/* Phần điều khiển xuất Excel dành cho "sales" */}
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
              }}
              disabled
            >
              <option value="sales">Quản lý sản phẩm</option>
            </Form.Control>
          </Form.Group>
        </Col>
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
              {/* <option value="detailed">Chi tiết</option> */}
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
        <Col xs={12} md={3} className="d-flex align-items-end">
          <Button
            variant="success"
            onClick={exportToExcel}
            disabled={
              !exportTable ||
              !exportType ||
              (!["all", "inventory"].includes(exportFilter) && !exportPeriod)
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

      {/* Hiển thị biểu đồ và bảng thống kê sản phẩm */}
      <Row className="mb-4">
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
              <Link to="/add-product">
                <Button variant="secondary" className="me-4">
                  Đăng sản phẩm
                </Button>
              </Link>
              <Link to="/edit-product">
                <Button variant="primary">Quản lý sản phẩm</Button>
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
          max-width: 150px;
        }
      `}</style>
    </Container>
  );
};

export default Dashboardwarehouse;
