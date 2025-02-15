import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const Dashboard = () => {
  const [orderStats, setOrderStats] = useState([]);
  const [inventoryStats, setInventoryStats] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("day");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hàm lấy thống kê đơn hàng
  const fetchOrderStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔍 Gọi API /api/order-stats");
      const token = localStorage.getItem("token"); // Lấy token từ localStorage
      const response = await axios.get(
        `/api/order-stats?period=${selectedPeriod}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Phản hồi API order-stats:", response.data);

      if (response.data && response.data.orderStats) {
        setOrderStats([
          { name: "Đang xử lý", orders: response.data.orderStats.processing },
          { name: "Đã xác nhận", orders: response.data.orderStats.confirmed },
          { name: "Đang giao hàng", orders: response.data.orderStats.shipping },
          { name: "Đã giao hàng", orders: response.data.orderStats.delivered },
          // Bỏ "Đã hủy" nếu API không cung cấp
        ]);
      } else {
        console.error(
          "❌ API order-stats trả về dữ liệu không hợp lệ:",
          response.data
        );
        setOrderStats([]);
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy thống kê đơn hàng:", error);
      setError("Không thể tải dữ liệu đơn hàng.");
      setOrderStats([]);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  // Hàm lấy thống kê hàng tồn kho
  const fetchInventoryStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔍 Gọi API /api/inventory/stats");
      const response = await axios.get(
        `/api/inventory/stats?period=${selectedPeriod}`
      );

      console.log("✅ Phản hồi API inventory-stats:", response.data);

      if (response.data && response.data.sales?.length) {
        setInventoryStats(
          response.data.sales.map((item) => ({
            name: item._id,
            sold: item.totalSold,
          }))
        );
      } else {
        console.error(
          "❌ API inventory-stats trả về dữ liệu không hợp lệ:",
          response.data
        );
        setInventoryStats([]);
      }
    } catch (error) {
      console.error("❌ Lỗi API fetchInventoryStats:", error);
      setError("Không thể tải dữ liệu kho hàng.");
      setInventoryStats([]);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  // Gọi API mỗi khi `selectedPeriod` thay đổi
  useEffect(() => {
    fetchOrderStats();
    fetchInventoryStats();
  }, [fetchOrderStats, fetchInventoryStats]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">📊 Bảng điều khiển quản lý</h1>

        {/* Bộ lọc thời gian */}
        <div className="mb-4">
          <label className="font-semibold">Thống kê theo: </label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="day">Ngày</option>
            <option value="week">Tuần</option>
            <option value="month">Tháng</option>
          </select>
        </div>

        {/* Hiển thị lỗi nếu có */}
        {error && <p className="text-red-500">{error}</p>}

        {/* Biểu đồ đơn hàng */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-2">
            📦 Trạng thái đơn hàng ({selectedPeriod})
          </h2>
          {loading ? (
            <p className="text-gray-500">Đang tải...</p>
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
            <p className="text-gray-500">Không có dữ liệu đơn hàng.</p>
          )}
        </div>

        {/* Biểu đồ hàng tồn kho */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">
            📊 Sản phẩm bán chạy ({selectedPeriod})
          </h2>
          {loading ? (
            <p className="text-gray-500">Đang tải...</p>
          ) : inventoryStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={inventoryStats}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sold" stroke="#F43F5E" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">Không có dữ liệu sản phẩm.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
