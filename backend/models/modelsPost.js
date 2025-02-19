// modelsPost.js
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true }, // tiêu đề
  content: { type: String, required: true },// noi dung
  tags: { type: [String], default: [] },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", 
    required: false, 
  },
  imageUrl: { type: String },
  date: { type: Date, default: Date.now }, // ngày đăng
});

const Post = mongoose.model("Post", postSchema);


module.exports = Post;
