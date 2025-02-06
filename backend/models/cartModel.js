const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", 
      required: [true, "Sản phẩm là bắt buộc"], 
    },
    quantity: {
      type: Number,
      required: [true, "Số lượng là bắt buộc"], 
      min: [1, "Số lượng phải lớn hơn hoặc bằng 1"], 
      default: 1, 
    },
  },
  { _id: false } 
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: [true, "Người dùng là bắt buộc"], 
    },
    items: {
      type: [cartItemSchema], 
      required: [true, "Giỏ hàng không thể trống"],
      validate: {
        validator: function (items) {
          return items.length > 0; 
        },
        message: "Giỏ hàng không thể trống", 
      },
    },
  },
  { timestamps: true } 
);

const Cart = mongoose.model("Cart", cartSchema);

// Xuất model
module.exports = Cart;
