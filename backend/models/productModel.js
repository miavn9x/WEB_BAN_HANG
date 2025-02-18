const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    name: { type: String, required: true },
    generic: { type: String, required: true },
  },
  brand: { type: String, required: true },
  description: { type: String, required: true },
  images: [
    {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return (
            /^(http|https):\/\/[^ "\n]+$/.test(value) ||
            /\.(jpg|jpeg|png|gif)$/.test(value)
          );
        },
        message: (props) =>
          `${props.value} is not a valid image URL or file path!`,
      },
    },
  ],
  originalPrice: { type: Number, required: true },
  discountPercentage: { type: Number, default: 0 },
  priceAfterDiscount: { type: Number, required: true },
  discountCode: { type: String },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  reviews: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reviewText: { type: String },
      rating: { type: Number, min: 1, max: 5 },
      createdAt: { type: Date, default: Date.now }, // Thêm trường này nếu cần sắp xếp theo thời gian
    },
  ],
  stock: { type: Number, required: true, min: 0 },
  remainingStock: { type: Number, required: true, min: 0, default: 0 },
  salesCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  tags: [{ type: String }],
  similarProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Tự động cập nhật updatedAt khi lưu sản phẩm
productSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
