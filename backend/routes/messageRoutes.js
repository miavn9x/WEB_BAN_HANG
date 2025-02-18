const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const authMiddleware = require("../middleware/authMiddleware");

// Tạo tin nhắn mới cho người dùng và sản phẩm
router.post("/messages", authMiddleware, async (req, res) => {
  const { productId, text, replyTo } = req.body;
  const userId = req.user._id; // Lấy userId từ token đã giải mã từ middleware

  if (!text || !productId) {
    return res.status(400).json({ error: "Missing productId or text" });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid productId format" });
    }

    // Tìm hoặc tạo tin nhắn cho người dùng
    let userMessage = await Message.findOne({ userId });

    if (!userMessage) {
      userMessage = new Message({ userId, productMessages: [] });
    }

    // Tìm sản phẩm trong productMessages
    const productMessagesIndex = userMessage.productMessages.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (productMessagesIndex === -1) {
      userMessage.productMessages.push({
        productId,
        messages: [{ text, createdAt: Date.now(), replyTo }],
      });
    } else {
      userMessage.productMessages[productMessagesIndex].messages.push({
        text,
        createdAt: Date.now(),
        replyTo,
      });
    }

    // Lưu tin nhắn vào DB
    await userMessage.save();
    res.status(201).json(userMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Lấy danh sách tin nhắn của người dùng cho sản phẩm
router.get("/messages/:userId/:productId", async (req, res) => {
  const { userId, productId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(productId)
  ) {
    return res
      .status(400)
      .json({ error: "Invalid userId or productId format" });
  }

  try {
    const userMessage = await Message.findOne({ userId });

    if (!userMessage) {
      return res.status(404).json({ error: "No messages found for this user" });
    }

    const productMessages = userMessage.productMessages.find(
      (item) => item.productId.toString() === productId.toString()
    );

    if (!productMessages) {
      return res
        .status(404)
        .json({ error: "No messages found for this product" });
    }

    res.json(productMessages.messages);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
