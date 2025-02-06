const express = require("express");
const router = express.Router();
const Question = require("../models/questionAnswerModel");
const Notification = require("../models/Notification");

// 1. Thêm một câu hỏi cho sản phẩm
router.post("/products/:productId/questions", async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId, questionText } = req.body;
    const newQuestion = new Question({ productId, userId, questionText });
    await newQuestion.save();
    // Populate thông tin của người dùng (tùy chỉnh trường bạn cần)
    await newQuestion.populate("userId", "firstName lastName");
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error("Error saving question:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Lấy danh sách câu hỏi (với câu trả lời) cho một sản phẩm
//    Hỗ trợ thêm tùy chọn giới hạn số lượng (limit, skip) nếu cần
router.get("/products/:productId/questions", async (req, res) => {
  try {
    const { productId } = req.params;
    // Nếu có query parameters limit và skip, chuyển đổi về kiểu số
    const limit = parseInt(req.query.limit) || 0; // 0 nghĩa là không giới hạn
    const skip = parseInt(req.query.skip) || 0;

    const questions = await Question.find({ productId })
      .populate("userId", "firstName lastName")
      .populate("answers.userId", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Thêm câu trả lời cho một câu hỏi
router.post("/questions/:questionId/answers", async (req, res) => {
  try {
    const { questionId } = req.params;
    const { userId, answerText, replyTo } = req.body;

    // Tìm câu hỏi gốc
    const question = await Question.findById(questionId).populate(
      "userId",
      "firstName lastName"
    );
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Tạo đối tượng câu trả lời và gắn productId từ câu hỏi
    const answerData = {
      productId: question.productId,
      userId,
      answerText,
    };
    if (replyTo) {
      answerData.replyTo = replyTo;
    }
    question.answers.push(answerData);
    await question.save();

    // Populate lại thông tin của các câu trả lời
    await question.populate("answers.userId", "firstName lastName");

    // Nếu người trả lời không phải là người tạo câu hỏi, tạo thông báo cho người tạo câu hỏi
    if (question.userId._id.toString() !== userId) {
      const notification = new Notification({
        receiverId: question.userId._id,
        senderId: userId,
        productId: question.productId,
        message: `Tin của bạn đã được trả lời: "${answerText.substring(
          0,
          50
        )}..."`,
      });
      await notification.save();
    }

    res.status(201).json(question);
  } catch (error) {
    console.error("Error saving answer:", error);
    res.status(500).json({ error: error.message });
  }
});

// 4. (Tùy chọn) Lấy tổng số tin nhắn (câu hỏi + câu trả lời) cho một sản phẩm
router.get("/products/:productId/messages/count", async (req, res) => {
  try {
    const { productId } = req.params;
    const questions = await Question.find({ productId });
    let count = 0;
    questions.forEach((q) => {
      count += 1; // tính câu hỏi
      if (q.answers && q.answers.length > 0) {
        count += q.answers.length; // tính số câu trả lời
      }
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
