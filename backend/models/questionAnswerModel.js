// models/questionAnswerModel.js
const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  answerText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  // Thêm trường replyTo: lưu thông tin của tin được trả lời.
  replyTo: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    questionText: String,
    answerText: String,
    createdAt: Date,
  },
});

const questionSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  questionText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  answers: [answerSchema],
});

const Question = mongoose.model("Question", questionSchema);
module.exports = Question;
