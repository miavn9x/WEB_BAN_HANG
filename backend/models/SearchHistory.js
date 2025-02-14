// models/SearchHistory.js
const mongoose = require("mongoose");

const searchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Người dùng là bắt buộc"],
    },
    query: {
      type: String,
      required: [true, "Từ khóa tìm kiếm là bắt buộc"],
    },
    searchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SearchHistory", searchHistorySchema);
