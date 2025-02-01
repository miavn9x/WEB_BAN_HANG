import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch all orders for admin
    const fetchOrders = async () => {
      try {
        const response = await axios.get("/api/orders/admin/orders", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Lấy token từ localStorage
          },
        });
        setOrders(response.data.orders);
      } catch (err) {
        setError("Không thể tải danh sách đơn hàng!");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

const handleStatusChange = async (orderId, newStatus) => {
  try {
    // You don't need the response variable
    await axios.put(`/api/orders/${orderId}/status`, {
      status: newStatus,
    });

    // Update the state with the new order status
    const updatedOrders = orders.map((order) =>
      order._id === orderId ? { ...order, orderStatus: newStatus } : order
    );
    setOrders(updatedOrders);
  } catch (error) {
    console.error("Error updating status", error);
  }
};


  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Danh sách đơn hàng</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Ngày đặt</th>
            <th>Tên khách hàng</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order.orderId}</td>
              <td>{order.formattedOrderDate}</td>
              <td>{order.userInfo.fullName}</td>
              <td>{order.totalAmount} VND</td>
              <td>{order.orderStatus}</td>
              <td>
                {/* Thay đổi trạng thái đơn hàng */}
                {order.orderStatus !== "Đã giao hàng" && (
                  <button
                    onClick={() =>
                      handleStatusChange(order._id, "Đã giao hàng")
                    }
                  >
                    Đã giao hàng
                  </button>
                )}
                {order.orderStatus !== "Đã hủy" && (
                  <button
                    onClick={() => handleStatusChange(order._id, "Đã hủy")}
                  >
                    Hủy
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrders;
