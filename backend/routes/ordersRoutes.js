// routes/ordersRoutes.js
const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel");
const authMiddleware = require("../middleware/authMiddleware");

// Route tạo đơn hàng mới (yêu cầu đăng nhập)
router.post("/orders", authMiddleware, async (req, res) => {
  try {
    const { orderId, items, totalAmount, paymentMethod, userInfo } = req.body;
    const userId = req.user._id; // Lấy userId từ token xác thực

    // Kiểm tra dữ liệu đầu vào
    if (!orderId || !items || !totalAmount || !paymentMethod || !userInfo) {
      return res.status(400).json({ message: "Thiếu thông tin đơn hàng!" });
    }

    // Tạo đơn hàng mới với userId
    const newOrder = new Order({
      orderId,
      userId, // Thêm userId vào đơn hàng
      items,
      totalAmount,
      paymentMethod,
      userInfo,
    });

    // Lưu đơn hàng vào database
    const savedOrder = await newOrder.save();

    // Trả về kết quả
    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công!",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Lỗi server:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo đơn hàng!",
      error: error.message,
    });
  }
});

// routes/ordersRoutes.js
router.get("/ordershistory", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ userId })
      .populate({
        path: "items.product",
        select: "name price image description category", // Lấy thêm các trường của sản phẩm
      })
      .sort({ dateOrdered: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Lỗi server:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy lịch sử đơn hàng!",
      error: error.message,
    });
  }
});

// Thêm route để lấy chi tiết một đơn hàng
router.get("/order/:orderId", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
      userId: req.user._id,
    }).populate({
      path: "items.product",
      select: "name price image description category",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng!",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Lỗi server:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết đơn hàng!",
      error: error.message,
    });
  }
});
module.exports = router;
