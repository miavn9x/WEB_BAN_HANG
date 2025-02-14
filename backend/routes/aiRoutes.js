const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Khởi tạo Gemini AI với API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware kiểm tra API Key
router.use((req, res, next) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "API Key chưa được cấu hình" });
  }
  next();
});

router.post("/analyze-review", async (req, res) => {
  try {
    const { text } = req.body;

    // Validate input
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Dữ liệu đầu vào không hợp lệ" });
    }

    // Giới hạn độ dài tối thiểu
    if (text.trim().length < 3) {
      return res.status(400).json({ error: "Vui lòng nhập ít nhất 3 ký tự" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Prompt tối ưu cho tiếng Việt
    const prompt = `Phân tích đánh giá sau (trả lời JSON):
    {
      "isNegative": boolean,
      "reasons": string[],
      "confidence": number
    }
    Đánh giá: "${text.substring(0, 1000)}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Xử lý response
    const cleanText = responseText.replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(cleanText);

    res.json({
      isNegative: analysis.isNegative || false,
      reasons: analysis.reasons || [],
      confidence: analysis.confidence || 0,
    });
  } catch (error) {
    console.error("Lỗi AI:", error);
    res.status(500).json({
      error: "Lỗi phân tích",
      details: error.message,
      action: "keep", // Giữ lại đánh giá nếu có lỗi
    });
  }
});

module.exports = router;
