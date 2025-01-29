//
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");

// API để tạo đơn hàng
router.post("/api/orders", async (req, res) => {
  const { userInfo, items, totalAmount, paymentMethod } = req.body;

  if (
    !userInfo ||
    !items ||
    items.length === 0 ||
    !totalAmount ||
    !paymentMethod
  ) {
    return res.status(400).json({ message: "Thiếu thông tin đơn hàng" });
  }

  // Tạo mã đơn hàng duy nhất
  const orderId = `ORD-${new Date().getTime()}-${Math.random()
    .toString(36)
    .substring(2, 10)}`;

  // Lấy thông tin sản phẩm từ cơ sở dữ liệu
  const orderItems = [];
  for (let item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      return res
        .status(400)
        .json({ message: `Sản phẩm ${item.name} không tồn tại` });
    }
    orderItems.push({
      productId: product._id,
      name: product.name,
      quantity: item.quantity,
      price: product.price,
    });
  }

  try {
    const newOrder = new Order({
      orderId,
      userInfo,
      items: orderItems,
      totalAmount,
      paymentMethod,
    });

    await newOrder.save();

    return res.status(200).json({ message: "Đơn hàng đã được tạo", orderId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi tạo đơn hàng" });
  }
});

// API cho người dùng xem đơn hàng của mình
router.get("/api/orders/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Order.find({ "userInfo._id": userId });

    if (orders.length === 0) {
      return res.status(404).json({ message: "Không có đơn hàng nào" });
    }

    return res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Đã xảy ra lỗi" });
  }
});

// API cho admin quản lý đơn hàng
router.get("/api/admin/orders", async (req, res) => {
  try {
    const orders = await Order.find().populate("items.productId"); // Dữ liệu đầy đủ của sản phẩm
    return res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi lấy danh sách đơn hàng" });
  }
});

// API để admin thay đổi trạng thái đơn hàng
router.put("/api/admin/orders/:orderId/status", async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!["Pending", "Processing", "Completed", "Cancelled"].includes(status)) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ" });
  }

  try {
    const order = await Order.findOneAndUpdate(
      { orderId },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tìm thấy" });
    }

    return res
      .status(200)
      .json({ message: "Cập nhật trạng thái đơn hàng thành công", order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Đã xảy ra lỗi" });
  }
});

module.exports = router;
