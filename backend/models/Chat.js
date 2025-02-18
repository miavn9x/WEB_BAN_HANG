// models/Chat.js
const mongoose = require("mongoose");

// Định nghĩa schema cho mỗi tin nhắn
const chatMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Thêm trường replyTo lưu thông tin của tin nhắn gốc (nếu có)
  replyTo: {
    type: {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      message: String,
      createdAt: Date,
    },
    default: null,
  },
});

// Định nghĩa schema cho cuộc trò chuyện
const chatSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    messages: [chatMessageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
