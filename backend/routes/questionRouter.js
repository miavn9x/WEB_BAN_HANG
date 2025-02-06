// routes/questionRouter.js
const express = require("express");
const router = express.Router();
const Question = require("../models/questionAnswerModel");

// Thêm một câu hỏi cho sản phẩm
router.post("/products/:productId/questions", async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId, questionText } = req.body;
    const newQuestion = new Question({ productId, userId, questionText });
    await newQuestion.save();
    // Populate thông tin người dùng để trả về đầy đủ
    await newQuestion.populate("userId", "firstName lastName");
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error("Error saving question:", error);
    res.status(500).json({ error: error.message });
  }
});

// Lấy danh sách câu hỏi (với câu trả lời) cho một sản phẩm
router.get("/products/:productId/questions", async (req, res) => {
  try {
    const { productId } = req.params;
    const questions = await Question.find({ productId })
      .populate("userId", "firstName lastName")
      .populate("answers.userId", "firstName lastName");
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Thêm câu trả lời cho một câu hỏi
router.post("/questions/:questionId/answers", async (req, res) => {
  try {
    const { questionId } = req.params;
    // Lấy thêm replyTo nếu có.
    const { userId, answerText, replyTo } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Tạo đối tượng câu trả lời, bao gồm replyTo (nếu có)
    const answerData = { userId, answerText };
    if (replyTo) {
      answerData.replyTo = replyTo;
    }

    // Thêm câu trả lời vào mảng answers.
    question.answers.push(answerData);
    await question.save();

    // Populate thông tin người dùng cho các câu trả lời.
    await question.populate("answers.userId", "firstName lastName");

    // Nếu cần, bạn cũng có thể populate replyTo.userId bằng cách viết thêm logic.
    res.status(201).json(question);
  } catch (error) {
    console.error("Error saving answer:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
