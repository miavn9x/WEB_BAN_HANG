const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel");
const authMiddleware = require("../middleware/authMiddleware");
const { sendOrderConfirmationEmail } = require("../utils/ordermail");
const Product = require("../models/productModel");
const Notification = require("../models/notificationModel");
const User = require("../models/User");


// ✅ API Tạo Đơn Hàng (Đã gộp chính xác)


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
      customerNote, // nhận customerNote từ req.body
    } = req.body;
    const userId = req.user._id;

    // Kiểm tra dữ liệu đầu vào
    if (
      !orderId ||
      !items?.length ||
      !totalAmount ||
      !paymentMethod ||
      !userInfo ||
      !userInfo.email
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin đơn hàng!" });
    }

    // Định dạng ngày đơn hàng
    const orderDate = new Date();
    const formattedDate = orderDate.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // Xác định trạng thái thanh toán ban đầu
    const initialPaymentStatus =
      paymentMethod === "cod" ? "Chưa thanh toán" : "Chờ xác nhận";

    // Tạo đơn hàng mới và truyền luôn customerNote
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
      orderDate,
      customerNote, // Lưu ghi chú khách hàng
    });

    // Lưu đơn hàng vào cơ sở dữ liệu
    const savedOrder = await newOrder.save();
    const populatedOrder = await Order.findById(savedOrder._id).populate(
      "items.product"
    );

    // Gửi email xác nhận đơn hàng (không làm gián đoạn API nếu có lỗi)
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
      console.error("❌ Lỗi khi gửi email xác nhận:", emailError);
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
    console.error("❌ Lỗi server khi tạo đơn hàng:", error);
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
      .populate("items.product")
      .sort({ orderDate: -1 });

    const formattedOrders = orders.map((order) => ({
      ...order._doc,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      formattedOrderDate: new Date(order.orderDate).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
      items: order.items.map((item) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        product: item.product,
      })),
    }));

    res.status(200).json({
      success: true,
      orders: formattedOrders,
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


router.get("/orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find() // Lấy tất cả đơn hàng
      .populate("items.product")
      .sort({ orderDate: -1 });

    const formattedOrders = orders.map((order) => ({
      ...order._doc,
      formattedOrderDate: new Date(order.orderDate).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
      items: order.items.map((item) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        product: item.product, // Thông tin sản phẩm
      })),
    }));

    res.status(200).json({
      success: true,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("Lỗi server:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin đơn hàng!",
      error: error.message,
    });
  }
});

router.put("/order/:id", authMiddleware, async (req, res) => {
  const { id: orderId } = req.params;
  const { orderStatus, paymentStatus } = req.body;

  try {
    const order = await Order.findById(orderId).populate("items.product");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng.",
      });
    }

    const oldOrderStatus = order.orderStatus;
    const userId = order.userId;

    if (orderStatus) {
      if (Object.values(ORDER_STATUS).includes(orderStatus)) {
        order.orderStatus = orderStatus;
      } else {
        return res.status(400).json({
          success: false,
          message: "Trạng thái đơn hàng không hợp lệ.",
        });
      }
    }

    if (paymentStatus) {
      if (Object.values(PAYMENT_STATUS).includes(paymentStatus)) {
        order.paymentStatus = paymentStatus;
      } else {
        return res.status(400).json({
          success: false,
          message: "Trạng thái thanh toán không hợp lệ.",
        });
      }
    }

    await order.save();

    const confirmedStatus = ["Đã xác nhận", "Đang giao hàng", "Đã giao hàng"];
    if (
      confirmedStatus.includes(order.orderStatus) &&
      !confirmedStatus.includes(oldOrderStatus)
    ) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product._id,
          { $inc: { remainingStock: -item.quantity } },
          { new: true }
        );
      }
    }

    if (
      oldOrderStatus !== "Đã hủy" &&
      confirmedStatus.includes(oldOrderStatus) &&
      order.orderStatus === "Đã hủy"
    ) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product._id,
          { $inc: { remainingStock: item.quantity } },
          { new: true }
        );
      }
    }

    const notificationMessage = `Đơn hàng ${order.orderId} của bạn đã được cập nhật sang trạng thái ${orderStatus} và thanh toán ${paymentStatus}`;
    const notification = new Notification({
      user: userId,
      title: "Thông báo về đơn hàng của bạn",
      message: notificationMessage,
      order: order._id,
    });

    await notification.save();
    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công.",
      order,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái đơn hàng.",
      error: error.message,
    });
  }
});

// huy don hang
router.post("/orders/:orderId/cancel", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    console.log("Attempting to cancel order:", orderId);

    const order = await Order.findOne({
      orderId: orderId,
      userId: userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng!",
      });
    }

    console.log("Order found:", order);
    
    // Chỉ cho phép hủy nếu đơn hàng đang ở trạng thái "Đang xử lý" và thanh toán "Chưa thanh toán"
    if (order.orderStatus !== ORDER_STATUS.PROCESSING || order.paymentStatus !== PAYMENT_STATUS.PENDING) {
      let message;
      if (order.orderStatus !== ORDER_STATUS.PROCESSING) {
        message = "Chỉ cho phép hủy khi đơn hàng đang ở trạng thái 'Đang xử lý'.";
      } else if (order.paymentStatus !== PAYMENT_STATUS.PENDING) {
        message = "Chỉ cho phép hủy khi đơn hàng chưa thanh toán.";
      } else {
        message = "Không thể hủy đơn hàng ở trạng thái hiện tại!";
      }

      return res.status(400).json({
        success: false,
        message: message,
      });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: orderId },
      { orderStatus: ORDER_STATUS.CANCELLED },
      { new: true, runValidators: false }
    );

    if (!updatedOrder) {
      throw new Error("Không thể cập nhật trạng thái đơn hàng");
    }

    res.status(200).json({
      success: true,
      message: "Hủy đơn hàng thành công!",
      order: {
        orderId: updatedOrder.orderId,
        orderStatus: updatedOrder.orderStatus,
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi hủy đơn hàng",
      error: error.message,
    });
  }
});


// Trong file routes/orderRoutes.js (hoặc file chứa các route đơn hàng)
router.put("/orders/:orderId/rate", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ orderId, userId });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng!" });
    }

    if (order.rated) {
      return res
        .status(400)
        .json({ success: false, message: "Đơn hàng đã được đánh giá!" });
    }

    order.rated = true;
    await order.save();

    res
      .status(200)
      .json({ success: true, message: "Đánh giá đơn hàng thành công!", order });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái đánh giá:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật trạng thái đánh giá!",
      error: error.message,
    });
  }
});

const { ORDER_STATUS, PAYMENT_STATUS } = require("../constants/orderConstants");
// xu lý đon hang cua admin

router.post("/payment/refund", authMiddleware, async (req, res) => {
  const { orderId, amount, paymentMethod } = req.body;

  try {
    const refundSuccess = true;

    if (refundSuccess) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found.",
        });
      }
      order.paymentStatus = "Hoàn tiền";
      await order.save();

      res.status(200).json({
        success: true,
        message: "Refund successful.",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Refund failed. Please try again.",
      });
    }
  } catch (error) {
    console.error("Error while processing refund:", error);
    res.status(500).json({
      success: false,
      message: "Error processing refund.",
      error: error.message,
    });
  }
});

// Cấu hình trạng thái (nếu cần dùng cho giao diện hay xử lý khác)
const statusConfig = {
  "Đang xử lý": { color: "warning", text: "Đang xử lý" },
  "Đã xác nhận": { color: "info", text: "Đã xác nhận" },
  "Đang giao hàng": { color: "primary", text: "Đang giao hàng" },
  "Đã giao hàng": { color: "success", text: "Đã giao hàng" },
  "Đã hủy": { color: "danger", text: "Đã hủy" },
};

// API: Thống kê đơn hàng với đầy đủ thông tin chi tiết (bao gồm: sản phẩm & người dùng)
router.get("/order-stats", authMiddleware, async (req, res) => {
  try {
    const { period = "day" } = req.query; // Mặc định là "day" nếu không có
    let startDate = new Date();
    let filter = {};

    // Xác định khoảng thời gian dựa trên period
    if (period === "day") {
      startDate.setHours(0, 0, 0, 0);
      filter = { createdAt: { $gte: startDate } };
    } else if (period === "week") {
      startDate.setDate(startDate.getDate() - 7);
      filter = { createdAt: { $gte: startDate } };
    } else if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
      filter = { createdAt: { $gte: startDate } };
    } else if (period === "quarter") {
      startDate.setMonth(startDate.getMonth() - 3);
      filter = { createdAt: { $gte: startDate } };
    } else if (period === "year") {
      startDate.setFullYear(startDate.getFullYear() - 1);
      filter = { createdAt: { $gte: startDate } };
    } else if (period === "all") {
      filter = {};
    } else {
      return res.status(400).json({
        success: false,
        message: "Thời gian không hợp lệ!",
      });
    }

    console.log("🔎 Lấy danh sách đơn hàng với filter:", filter);

    // Tìm tất cả đơn hàng theo filter, populate thông tin sản phẩm và người dùng
    const orders = await Order.find(filter)
      .populate("items.product") // Lấy đầy đủ chi tiết sản phẩm
      .populate("userId") // Lấy đầy đủ thông tin người dùng (User model đã loại bỏ password,...)
      .sort({ createdAt: -1 });

    // Khởi tạo thống kê đơn hàng (số lượng)
    const orderStats = {
      processing: 0, // Đang xử lý
      confirmed: 0, // Đã xác nhận
      shipping: 0, // Đang giao hàng
      delivered: 0, // Đã giao hàng
      canceled: 0, // Đã hủy
    };

    // Khởi tạo thống kê doanh thu (tiền)
    const revenueStats = {
      processing: 0,
      confirmed: 0,
      shipping: 0,
      delivered: 0,
    };

    // Lưu danh sách đơn hàng theo từng trạng thái (nếu cần dùng cho chi tiết)
    const categorizedOrders = {
      processing: [],
      confirmed: [],
      shipping: [],
      delivered: [],
      canceled: [],
    };

    orders.forEach((order) => {
      // Chuẩn hóa thông tin đơn hàng với đầy đủ chi tiết:
      const formattedOrder = {
        orderId: order.orderId,
        userInfo: order.userInfo, // Thông tin lúc đặt hàng (snapshot)
        user: order.userId, // Thông tin chi tiết người dùng (đã populate)
        totalAmount: order.totalAmount,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        formattedOrderDate: new Date(order.createdAt).toLocaleString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
        items: order.items.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          product: item.product, // Chi tiết sản phẩm đã populate
        })),
      };

      // Phân loại đơn hàng và tính doanh thu theo trạng thái
      if (order.orderStatus === "Đang xử lý") {
        orderStats.processing++;
        categorizedOrders.processing.push(formattedOrder);
        revenueStats.processing += order.totalAmount;
      } else if (order.orderStatus === "Đã xác nhận") {
        orderStats.confirmed++;
        categorizedOrders.confirmed.push(formattedOrder);
        revenueStats.confirmed += order.totalAmount;
      } else if (order.orderStatus === "Đang giao hàng") {
        orderStats.shipping++;
        categorizedOrders.shipping.push(formattedOrder);
        revenueStats.shipping += order.totalAmount;
      } else if (order.orderStatus === "Đã giao hàng") {
        orderStats.delivered++;
        categorizedOrders.delivered.push(formattedOrder);
        revenueStats.delivered += order.totalAmount;
      } else if (order.orderStatus === "Đã hủy") {
        orderStats.canceled++;
        categorizedOrders.canceled.push(formattedOrder);
      }
    });

    console.log("📊 Thống kê đơn hàng:", orderStats);
    console.log("💰 Thống kê doanh thu:", revenueStats);

    res.status(200).json({
      success: true,
      orderStats,
      revenueStats, // Doanh thu theo từng trạng thái
      categorizedOrders,
      statusConfig,
    });
  } catch (error) {
    console.error("❌ Lỗi API order-stats:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Thống kê bán hàng với thông tin chi tiết sản phẩm
router.get("/sales-stats", authMiddleware, async (req, res) => {
  try {
    const { period = "all", year } = req.query; // Mặc định lấy toàn bộ dữ liệu
    let startDate = null;
    const now = new Date();

    // Xác định khoảng thời gian lọc
    if (period === "day") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === "week") {
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
    } else if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === "quarter") {
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
    } else if (period === "year") {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else if (period === "multi-year" && year) {
      startDate = new Date(year, 0, 1);
    }
    // Nếu period là "all", startDate vẫn là null và không áp dụng bộ lọc

    // Xây dựng bộ lọc cho MongoDB
    let filter = {};
    if (startDate) {
      filter.orderDate = { $gte: startDate };
    }

    // Thực hiện aggregation thống kê đơn hàng theo thời gian
    const salesAggregation = await Order.aggregate([
      { $match: filter }, // Lọc theo khoảng thời gian nếu có
      { $unwind: "$items" }, // Tách từng sản phẩm trong đơn hàng
      {
        $group: {
          _id: "$items.product", // Gom nhóm theo sản phẩm
          totalSold: { $sum: "$items.quantity" }, // Tổng số lượng đã bán
        },
      },
      { $sort: { totalSold: -1 } }, // Sắp xếp theo số lượng bán giảm dần
    ]);

    // Tổng số lượng sản phẩm bán ra theo khoảng thời gian
    const totalSoldFiltered = salesAggregation.reduce(
      (acc, curr) => acc + curr.totalSold,
      0
    );

    const bestSellingProducts = await Product.populate(salesAggregation, {
      path: "_id",
      populate: [
        { path: "similarProducts", model: "Product" },
        { path: "reviews.userId", model: "User" },
      ],
    });

    // Chuyển đổi dữ liệu để trả về với đầy đủ chi tiết sản phẩm
    const bestSelling = bestSellingProducts.map((item) => {
      const product = item._id;
      return {
        productId: product._id,
        name: product.name,
        category: product.category,
        brand: product.brand,
        description: product.description,
        images: product.images,
        originalPrice: product.originalPrice,
        discountPercentage: product.discountPercentage,
        priceAfterDiscount: product.priceAfterDiscount,
        discountCode: product.discountCode,
        rating: product.rating,
        reviews: product.reviews,
        stock: product.stock,
        remainingStock: product.remainingStock,
        salesCount: product.salesCount,
        viewCount: product.viewCount,
        tags: product.tags,
        similarProducts: product.similarProducts,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        totalSold: item.totalSold,
        soldCalculated: product.stock - product.remainingStock, // Số lượng đã bán thực tế
      };
    });

    // Lấy tổng số hàng trong kho (không phụ thuộc khoảng thời gian)
    const inventoryAggregation = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: "$stock" },
          totalRemaining: { $sum: "$remainingStock" },
          totalSold: { $sum: { $subtract: ["$stock", "$remainingStock"] } },
        },
      },
    ]);
    const totalInventory = inventoryAggregation[0] || {
      totalStock: 0,
      totalRemaining: 0,
      totalSold: 0,
    };

    res.status(200).json({
      success: true,
      totalSoldFiltered, 
      bestSelling, 
      totalInventory, 
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy thống kê bán hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê bán hàng.",
      error: error.message,
    });
  }
});




module.exports = router;
