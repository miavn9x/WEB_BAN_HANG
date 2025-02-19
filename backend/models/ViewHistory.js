const mongoose = require("mongoose");

const viewHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Đã tạo index duy nhất cho trường này
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Xóa bỏ dòng tạo index duplicate cho trường user
// viewHistorySchema.index({ user: 1 });

viewHistorySchema.index({ "products.viewedAt": -1 });

module.exports = mongoose.model("ViewHistory", viewHistorySchema);
