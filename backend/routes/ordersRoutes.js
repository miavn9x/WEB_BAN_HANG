// routes/ordersRoutes.js
const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel");
const authMiddleware = require("../middleware/authMiddleware");
const nodemailer = require("nodemailer");
const { sendOrderConfirmationEmail } = require('../utils/ordermail'); // Import module gửi email

// Route tạo đơn hàng
router.post("/orders", authMiddleware, async (req, res) => {
  try {
    const {
      orderId,
      items,
      totalAmount,
      subtotal,
      shippingFee,
      paymentMethod,
      userInfo,
    } = req.body;

    const userId = req.user._id;

    // Validate input
    if (
      !orderId ||
      !items ||
      !totalAmount ||
      !paymentMethod ||
      !userInfo ||
      !userInfo.email
    ) {
      return res.status(400).json({ message: "Thiếu thông tin đơn hàng!" });
    }

    const orderDate = new Date();
    const formattedDate = orderDate.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Xác định trạng thái thanh toán dựa trên phương thức
    const initialPaymentStatus =
      paymentMethod === "cod" ? "Chưa thanh toán" : "Đợi xác nhận";

    const newOrder = new Order({
      orderId,
      userId,
      items,
      totalAmount,
      subtotal,
      shippingFee,
      paymentMethod,
      paymentStatus: initialPaymentStatus,
      userInfo,
      orderStatus: "Đang xử lý",
      orderDate: orderDate,
    });

    const savedOrder = await newOrder.save();
    const populatedOrder = await Order.findById(savedOrder._id).populate(
      "items.product"
    );

    // Gửi email xác nhận với thông tin thời gian
    try {
      await sendOrderConfirmationEmail(
        {
          ...req.body,
          paymentStatus: initialPaymentStatus,
          formattedOrderDate: formattedDate,
        },
        userInfo.email
      );
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
    }

    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công!",
      order: {
        ...populatedOrder.toObject(),
        formattedOrderDate: formattedDate,
      },
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


// Route lấy lịch sử đơn hàng
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
      orderDate: new Date(order.orderDate).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
      formattedOrderDate: order.formattedOrderDate,
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

// Route lấy chi tiết đơn hàng
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

    // Format order data
    const formattedOrder = {
      ...order._doc,
      orderDate: new Date(order.orderDate).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
      formattedOrderDate: order.formattedOrderDate,
      items: order.items.map(item => ({
        ...item._doc,
        product: {
          ...item.product._doc,
          price: item.price,
          name: item.name,
          image: item.image
        }
      }))
    };

    res.status(200).json({
      success: true,
      order: formattedOrder
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

// Route hủy đơn hàng
router.post("/orders/:orderId/cancel", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    console.log("Cancel request:", { orderId, userId });

    // Tìm đơn hàng sử dụng orderId string
    const order = await Order.findOne({
      orderId: orderId, // Tìm theo orderId string
      userId: userId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng để hủy!",
      });
    }

    // Kiểm tra trạng thái
    if (order.orderStatus !== "Đang xử lý") {
      return res.status(400).json({
        success: false,
        message: "Chỉ đơn hàng 'Đang xử lý' mới có thể hủy!",
      });
    }

    // Cập nhật trạng thái
    order.orderStatus = "Đã hủy";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Đơn hàng đã được hủy thành công!",
      order: {
        orderId: order.orderId,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        formattedOrderDate: order.formattedOrderDate
      }
    });

  } catch (error) {
    console.error("Lỗi server:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi hủy đơn hàng!",
      error: error.message
    });
  }
});

module.exports = router;
