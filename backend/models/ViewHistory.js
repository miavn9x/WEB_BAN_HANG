const mongoose = require("mongoose");

const viewHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // 1 user chỉ có 1 document
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

// Indexes tối ưu hiệu suất
viewHistorySchema.index({ user: 1 });
viewHistorySchema.index({ "products.viewedAt": -1 });

module.exports = mongoose.model("ViewHistory", viewHistorySchema);
