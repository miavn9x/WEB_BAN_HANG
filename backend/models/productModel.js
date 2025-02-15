const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên sản phẩm
  category: {
    name: { type: String, required: true }, // Tên danh mục
    generic: { type: String, required: true }, // Loại sản phẩm trong danh mục
  },
  brand: { type: String, required: true }, // Thương hiệu
  description: { type: String, required: true }, // Mô tả chi tiết
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
  ], // Danh sách ảnh sản phẩm
  originalPrice: { type: Number, required: true }, // Giá gốc
  discountPercentage: { type: Number, default: 0 }, // Phần trăm giảm giá
  priceAfterDiscount: { type: Number, required: true }, // Giá sau khi giảm
  discountCode: { type: String }, // Mã giảm giá
  rating: { type: Number, min: 1, max: 5, default: 5 }, // Đánh giá
  reviews: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Id người dùng đã đánh giá
      reviewText: { type: String }, // Nội dung nhận xét
      rating: { type: Number, min: 1, max: 5 }, // Đánh giá sao
    },
  ],
  stock: { type: Number, required: true, min: 0 }, // Số lượng trong kho
  remainingStock: { type: Number, required: true, min: 0, default: 0 }, // Số lượng còn lại

  // 🔹 Thêm các trường mới để tối ưu đề xuất sản phẩm
  salesCount: { type: Number, default: 0 }, // 🔥 Theo dõi số lần sản phẩm được bán
  viewCount: { type: Number, default: 0 }, // 👀 Theo dõi số lần sản phẩm được xem
  tags: [{ type: String }], // 🏷️ Từ khóa liên quan để tìm kiếm tốt hơn

  similarProducts: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // 🔁 Danh sách sản phẩm tương tự
  ],

  // 🔄 Thời gian tạo và cập nhật sản phẩm
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 🔹 Tự động cập nhật `updatedAt` mỗi khi sản phẩm thay đổi
productSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
