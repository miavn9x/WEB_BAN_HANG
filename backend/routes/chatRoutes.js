// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

// Dành cho người dùng: lấy và gửi tin nhắn trong cuộc trò chuyện riêng theo sản phẩm
router.get("/private", chatController.getChat);
router.post("/private", chatController.addMessage);

// Dành cho admin: lấy tất cả các cuộc trò chuyện của 1 sản phẩm
router.get("/product/:productId", chatController.getChatsByProduct);

module.exports = router;
