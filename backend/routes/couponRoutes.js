// File: routes/user.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

// Áp dụng coupon
router.post("/apply", authMiddleware, async (req, res) => {
  try {
    const { couponCode } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User không tồn tại" });
    if (!couponCode)
      return res.status(400).json({ message: "Thiếu mã giảm giá" });

    // Kiểm tra trùng lặp
    const existingCoupon = user.coupons.find(
      (c) => c.couponCode.normalize("NFC") === couponCode.normalize("NFC")
    );

    if (existingCoupon) {
      return res.status(400).json({ message: "Mã đã được sử dụng" });
    }

    // Thêm coupon mới
    user.coupons.push({
      couponCode,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 ngày
    });

    await user.save();
    res.json({
      success: true,
      message: `Áp dụng mã ${couponCode} thành công`,
      coupons: user.coupons,
    });
  } catch (error) {
    console.error("Lỗi apply coupon:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Lấy danh sách coupon của user
router.get("/my-coupons", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("coupons");
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    res.json({ coupons: user.coupons });
  } catch (error) {
    console.error("Lỗi lấy coupon:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
