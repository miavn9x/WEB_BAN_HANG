const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const questionAnswerModel = require("../models/questionAnswerModel");

// Thêm tin nhắn (câu hỏi hoặc câu trả lời)
router.post("/products/:productId/messages", async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId, text, type, replyTo } = req.body;

    // Kiểm tra productId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid productId" });
    }

    let conversation = await questionAnswerModel.findOne({ productId });
    if (!conversation) {
      conversation = new questionAnswerModel({ productId, messages: [] });
    }

    const newMessage = {
      userId,
      text,
      type,
      replyTo: replyTo || null,
      createdAt: new Date(),
    };

    // Thêm tin nhắn vào cuộc trò chuyện
    conversation.messages.push(newMessage);

    // Lưu lại cuộc trò chuyện vào MongoDB
    await conversation.save();

    res.status(201).json(conversation);
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({ error: error.message });
  }
});

// Lấy danh sách tin nhắn của sản phẩm
router.get("/products/:productId/messages", async (req, res) => {
  try {
    const { productId } = req.params;

    // Kiểm tra productId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid productId" });
    }

    // Lấy cuộc trò chuyện và populate thông tin user cho tin nhắn
    const conversation = await questionAnswerModel
      .findOne({ productId })
      .populate("messages.userId", "firstName lastName");
    // Không populate "messages.replyTo" vì chưa đăng ký model "Message"

    if (!conversation) {
      return res.status(404).json({ messages: [] });
    }

    // Thực hiện populate thủ công cho replyTo: tìm tin nhắn gốc trong mảng messages của cùng cuộc trò chuyện.
    const messages = conversation.messages.map((message) => {
      if (message.replyTo) {
        // Tìm tin nhắn gốc có _id trùng với replyTo của tin nhắn hiện tại
        const original = conversation.messages.find((m) =>
          m._id.equals(message.replyTo)
        );
        if (original) {
          // Chuyển message về dạng đối tượng thường (plain object)
          message = message.toObject();
          message.replyTo = {
            _id: original._id,
            text: original.text,
            userId: original.userId, // đã được populate từ messages.userId
            createdAt: original.createdAt,
          };
        }
      }
      return message;
    });

    res.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
