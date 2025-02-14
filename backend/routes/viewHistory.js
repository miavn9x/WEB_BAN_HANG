const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ViewHistory = require("../models/ViewHistory");
const authMiddleware = require("../middleware/authMiddleware");

const MAX_HISTORY = 50;

router.post("/", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { product } = req.body;
    const userId = req.user._id;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(product)) {
      await session.abortTransaction();
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }

    // Cập nhật lịch sử với 1 lệnh MongoDB duy nhất
    const result = await ViewHistory.findOneAndUpdate(
      { user: userId },
      {
        $push: {
          products: {
            $each: [
              {
                product: new mongoose.Types.ObjectId(product),
                viewedAt: new Date(),
              },
            ],
            $sort: { viewedAt: -1 }, // Sắp xếp giảm dần
            $slice: MAX_HISTORY, // Giữ 50 bản ghi mới nhất
          },
        },
      },
      {
        new: true,
        upsert: true, // Tạo mới nếu chưa có
        session,
        populate: {
          path: "products.product",
          select: "name price images", // Lấy các trường cần thiết
        },
      }
    );

    await session.commitTransaction();
    res.status(200).json({
      _id: result._id,
      user: result.user,
      products: result.products,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Lỗi xử lý lịch sử xem:", error);
    res.status(500).json({
      message: "Lỗi hệ thống",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
});

module.exports = router;
