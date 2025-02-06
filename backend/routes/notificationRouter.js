// routes/notificationRouter.js
const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// Lấy danh sách thông báo cho người dùng (giả sử userId được truyền qua query hoặc token)
router.get("/notificationId", async (req, res) => {
  try {
    // Ví dụ: userId được truyền qua query ?userId=...
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    const notifications = await Notification.find({ receiverId: userId })
      .sort({ createdAt: -1 })
      .populate("senderId", "firstName lastName");
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cập nhật trạng thái đã đọc của thông báo (nếu cần)
router.put("/:notificationId/read", async (req, res) => {
  try {
    const { notificationId } = req.params;
    const updated = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
