const mongoose = require("mongoose");

const SearchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Mỗi user chỉ có 1 document lưu lịch sử tìm kiếm
    },
    searches: [
      {
        query: { type: String, required: true },
        searchedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Tối ưu hóa truy vấn
SearchHistorySchema.index({ user: 1 });
SearchHistorySchema.index({ "searches.searchedAt": -1 });

module.exports = mongoose.model("SearchHistory", SearchHistorySchema);
