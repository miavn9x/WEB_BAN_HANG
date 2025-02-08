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

    // Kiểm tra nếu replyTo được cung cấp thì phải là ObjectId hợp lệ
    const replyToId =
      replyTo && mongoose.Types.ObjectId.isValid(replyTo) ? replyTo : null;

    const newMessage = {
      userId,
      text,
      type,
      replyTo: replyToId,
      createdAt: new Date(),
    };

    // Thêm tin nhắn vào cuộc trò chuyện
    conversation.messages.push(newMessage);
    await conversation.save();

    // Trả về danh sách tin nhắn sau khi thêm (đảm bảo là mảng)
    res.status(201).json({
      message: "Message added successfully",
      messages: conversation.messages,
    });
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

    if (!conversation) {
      return res.status(404).json({ messages: [] });
    }

    // Thực hiện populate thủ công cho replyTo
    const messages = conversation.messages.map((message) => {
      const msgObj = message.toObject();

      if (msgObj.replyTo) {
        // Tìm tin nhắn gốc có _id trùng với replyTo của tin nhắn hiện tại
        const originalMessage = conversation.messages.find((m) =>
          m._id.equals(msgObj.replyTo)
        );

        if (originalMessage) {
          msgObj.replyTo = {
            _id: originalMessage._id,
            text: originalMessage.text,
            userId: originalMessage.userId, // đã populate thông tin userId
            createdAt: originalMessage.createdAt,
          };
        }
      }
      return msgObj;
    });

    res.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
