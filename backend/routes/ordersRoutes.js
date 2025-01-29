// routes/ordersRoutes.js
const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel");
const authMiddleware = require("../middleware/authMiddleware");

// Route tạo đơn hàng mới (yêu cầu đăng nhập)
router.post("/orders", authMiddleware, async (req, res) => {
  try {
    const {
      orderId,
      items,
      totalAmount,
      subtotal,
      shippingFee,
      paymentMethod,
      paymentStatus,
      userInfo,
      orderStatus
    } = req.body;
    
    const userId = req.user._id;

    // Validate input
    if (!orderId || !items || !totalAmount || !paymentMethod || !userInfo) {
      return res.status(400).json({ message: "Thiếu thông tin đơn hàng!" });
    }

    const newOrder = new Order({
      orderId,
      userId,
      items,
      totalAmount,
      subtotal,
      shippingFee,
      paymentMethod,
      paymentStatus,
      userInfo,
      orderStatus,
      orderDate: new Date()
    });

    const savedOrder = await newOrder.save();

    // Populate product details
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('items.product');

    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công!",
      order: populatedOrder
    });

  } catch (error) {
    console.error("Lỗi server:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo đơn hàng!",
      error: error.message
    });
  }
});

// routes/ordersRoutes.js
router.get("/ordershistory", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ userId })
      .populate('items.product')
      .sort({ orderDate: -1 });

    // Transform data before sending
    const formattedOrders = orders.map(order => ({
      ...order._doc,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      orderDate: order.orderDate.toLocaleDateString('vi-VN'),
      items: order.items.map(item => ({
        ...item._doc,
        product: {
          ...item.product._doc,
          price: item.price,
          name: item.name,
          image: item.image
        }
      }))
    }));

    res.status(200).json({
      success: true,
      orders: formattedOrders
    });
  } catch (error) {
    console.error("Lỗi server:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy lịch sử đơn hàng!",
      error: error.message
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
