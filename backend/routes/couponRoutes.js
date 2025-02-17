// routes/coupons.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware"); // Middleware xác thực

// API: Lưu mã giảm giá vào user
router.post("/apply", authMiddleware, async (req, res) => {
  const { couponCode } = req.body;
  const userId = req.user._id; // Lấy userId từ token

  if (!couponCode) {
    return res.status(400).json({ message: "Thiếu mã giảm giá" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    // Kiểm tra nếu mã giảm giá đã tồn tại trong danh sách coupons của user
    if (user.coupons.includes(couponCode)) {
      return res.status(400).json({ message: "Mã này đã được sử dụng" });
    }

    // Thêm mã giảm giá vào danh sách của user
    user.coupons.push(couponCode);
    await user.save();

    res.json({
      message: `Mã ${couponCode} đã được lưu thành công`,
      coupons: user.coupons,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// API: Lấy danh sách mã giảm giá của user
router.get("/my-coupons", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("coupons");
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    res.json({ coupons: user.coupons });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
});


module.exports = router;
