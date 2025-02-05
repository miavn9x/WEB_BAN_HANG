// modelsPost.js
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  // Lưu các thẻ dưới dạng mảng chuỗi (chỉ lưu text của tag)
  tags: { type: [String], default: [] },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: false, // Sửa required: false để không bắt buộc phải có sản phẩm
  },
  // Lưu URL của ảnh chính cho bài viết
  imageUrl: { type: String },
  date: { type: Date, default: Date.now },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
