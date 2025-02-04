// routes/posts.js
const express = require("express");
const Post = require("../models/modelsPost");
const Product = require("../models/productModel");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const router = express.Router();

// --- Cấu hình Cloudinary và multer ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");

// API upload ảnh (không thay đổi)
router.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
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
    uploadStream.end(file.buffer);
  });
});

// API tạo bài viết (POST)
router.post("/posts", async (req, res) => {
  const { title, content, tags, productId, imageUrl } = req.body;

  // Kiểm tra bắt buộc title và content
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }

  try {
    // Nếu có productId, kiểm tra sản phẩm tồn tại
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found." });
      }
    }
    
    // Parse tags nếu có (tags được truyền dưới dạng mảng object { id, text })
    const parsedTags = Array.isArray(tags)
      ? tags.map((tag) => tag.text || tag)
      : [];

    const newPost = new Post({
      title,
      content,
      tags: parsedTags,
      // Nếu không có productId, lưu null
      productId: productId || null,
      imageUrl,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Error creating post" });
  }
});


// API cập nhật bài viết (PUT)
router.put("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content, tags, productId, imageUrl } = req.body;

  // Chỉ bắt buộc title và content
  if (!title || !content) {
    return res
      .status(400)
      .json({ error: "Title and content are required." });
  }

  try {
    // Nếu có productId, kiểm tra xem sản phẩm có tồn tại không
    let validProductId = null;
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found." });
      }
      validProductId = productId;
    }

    // Parse tags: nếu tags được gửi dưới dạng mảng object { id, text }
    const parsedTags = Array.isArray(tags)
      ? tags.map((tag) => tag.text || tag)
      : [];

    // Cập nhật bài viết
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    post.title = title;
    post.content = content;
    post.tags = parsedTags;
    post.productId = validProductId; // Nếu không có productId, trường này sẽ được lưu là null
    post.imageUrl = imageUrl;

    await post.save();
    res.status(200).json(post);
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).json({ error: "Error updating post" });
  }
});

// API xóa bài viết (DELETE)
router.delete("/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ error: "Error deleting post" });
  }
});

// API lấy danh sách tất cả bài viết (GET)
router.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.status(200).json({ posts });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: "Error fetching posts" });
  }
});

// API lấy chi tiết bài viết (GET)
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
