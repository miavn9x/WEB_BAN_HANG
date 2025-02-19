const mongoose = require("mongoose");

const SearchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Đã tạo index duy nhất cho trường này
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

// Xóa bỏ dòng tạo index duplicate cho trường user
// SearchHistorySchema.index({ user: 1 });

SearchHistorySchema.index({ "searches.searchedAt": -1 });

module.exports = mongoose.model("SearchHistory", SearchHistorySchema);
