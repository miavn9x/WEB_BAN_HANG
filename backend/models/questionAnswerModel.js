const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: { type: String, required: true },
  type: {
    type: String,
    enum: ["question", "answer"],
    required: true,
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message", // tham chiếu lại tin nhắn gốc khi trả lời
  },
  createdAt: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  messages: [messageSchema],
});

const questionAnswerModel = mongoose.model("questionAnswerModel", conversationSchema);

module.exports = questionAnswerModel;
