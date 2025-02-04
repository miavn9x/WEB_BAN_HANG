const express = require("express");
const Post = require("../models/modelsPost");
const Product = require("../models/productModel"); // Import model Product
const cloudinary = require("cloudinary").v2; // Import Cloudinary
const multer = require("multer");
const router = express.Router();

// Cấu hình Cloudinary từ tệp .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cấu hình multer để upload ảnh (lưu vào bộ nhớ)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn dung lượng file (5MB)
}).single("image");

// API upload ảnh sử dụng upload_stream
router.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Sử dụng upload_stream thay vì upload trực tiếp với file.buffer
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "blog_images" },
      (error, result) => {
        if (error) {
          console.error("Error uploading to Cloudinary:", error);
          return res
            .status(500)
            .json({ error: "Error uploading to Cloudinary" });
        }
        res.status(200).json({ imageUrl: result.secure_url });
      }
    );

    // Đẩy Buffer vào upload_stream
    uploadStream.end(file.buffer);
  });
});
// API tạo bài viết
router.post("/posts", async (req, res) => {
  // Front end gửi: title, content, tags, productId, imageUrl
  const { title, content, tags, productId, imageUrl } = req.body;

  // Kiểm tra các trường bắt buộc
  if (!title || !content || !productId) {
    return res
      .status(400)
      .json({ error: "Title, content, and product are required." });
  }

  try {
    // Kiểm tra xem sản phẩm có tồn tại trong CSDL hay không
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    // Nếu tags được gửi dưới dạng mảng các đối tượng (có thuộc tính text),
    // chuyển chúng thành mảng các chuỗi
    const parsedTags = Array.isArray(tags)
      ? tags.map((tag) => tag.text || tag)
      : [];

    // Tạo bài viết mới
    const newPost = new Post({
      title,
      content,
      tags: parsedTags,
      productId,
      imageUrl, // Lưu URL ảnh chính của bài viết
    });

    // Lưu bài viết vào CSDL
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Error creating post" });
  }
});


// API lấy danh sách tất cả bài viết
router.get("/posts", async (req, res) => {
  try {
    // Lấy tất cả bài viết, sắp xếp theo ngày giảm dần
    const posts = await Post.find().sort({ date: -1 });
    res.status(200).json({ posts });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: "Error fetching posts" });
  }
});

// API lấy chi tiết một bài viết theo id
router.get("/posts/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }
    res.status(200).json(post);
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).json({ error: "Error fetching post" });
  }
});

module.exports = router;
