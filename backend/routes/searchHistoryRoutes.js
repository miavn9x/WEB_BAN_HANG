// routes/searchHistoryRoutes.js
const express = require("express");
const router = express.Router();
const {
  createSearchHistory,
  getSearchHistory,
} = require("../controllers/searchHistoryController");

const protect = require("../middleware/authMiddleware");

// Tạo mới một bản ghi lịch sử tìm kiếm
router.post("/", protect, createSearchHistory);

// Lấy lịch sử tìm kiếm của người dùng hiện tại
router.get("/", protect, getSearchHistory);

module.exports = router;
