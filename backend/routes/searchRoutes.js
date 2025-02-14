const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const SearchHistory = require("../models/SearchHistory");
const authMiddleware = require("../middleware/authMiddleware");

const MAX_HISTORY = 50; // Giới hạn số bản ghi lưu

// Route thêm truy vấn tìm kiếm
router.post("/searchtext", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { query } = req.body;
    const userId = req.user._id;

    if (!query) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Thiếu query" }); // Lỗi chỉ trả về khi thiếu query
    }

    const result = await SearchHistory.findOneAndUpdate(
      { user: userId },
      {
        $push: {
          searches: {
            $each: [{ query, searchedAt: new Date() }],
            $sort: { searchedAt: -1 },
            $slice: MAX_HISTORY,
          },
        },
      },
      {
        new: true,
        upsert: true,
        session,
      }
    );

    await session.commitTransaction();
    res.status(200).json({ history: result }); // Không cần thông báo riêng
  } catch (error) {
    await session.abortTransaction();
    console.error("Lỗi cập nhật lịch sử tìm kiếm:", error);
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  } finally {
    session.endSession();
  }
});


// Route lấy lịch sử tìm kiếm của người dùng
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const history = await SearchHistory.findOne({ user: userId });
    res.status(200).json({ history });
  } catch (error) {
    console.error("Lỗi lấy lịch sử tìm kiếm:", error);
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  }
});

module.exports = router;
