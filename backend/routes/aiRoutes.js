const express = require("express");
const Product = require("../models/productModel");
const multer = require("multer"); // Nhập multer vào
const path = require("path"); // Để xử lý đường dẫn file
const fs = require("fs"); // Để xử lý việc lưu trữ file
const router = express.Router();

// Cấu hình multer để lưu trữ file vào thư mục tạm thời trên server
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Chỉ định thư mục để lưu trữ hình ảnh
    cb(null, "uploads/"); // Lưu trữ trong thư mục "uploads"
  },
  filename: (req, file, cb) => {
    // Đổi tên file để tránh trùng lặp (thêm timestamp vào tên file)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Đảm bảo file có phần mở rộng gốc
  },
});

const upload = multer({ storage: storage });

// API AI search để xử lý hình ảnh
router.post("/ai-search", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Không có hình ảnh được tải lên." });
  }

  try {
    const imagePath = path.join(__dirname, "../uploads", req.file.filename);

    res.json({
      message: "Hình ảnh đã được tải lên thành công",
      imagePath: imagePath,
    });
  } catch (err) {
    console.error("Lỗi khi xử lý hình ảnh:", err);
    return res.status(500).json({ error: "Lỗi xử lý hình ảnh." });
  }
});

// Hàm loại bỏ ký tự đặc biệt trong regex
const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

// Các route tìm kiếm sản phẩm không thay đổi
router.post("/search", async (req, res, next) => {
  try {
    const {
      query = "",
      categoryName,
      categoryGeneric,
      minPrice,
      maxPrice,
      sortBy = "default",
      limit = 20,
    } = req.body;

    let searchQuery = {};

    if (query.trim()) {
      const safeQuery = escapeRegex(query.trim());
      searchQuery.$or = [
        { name: { $regex: safeQuery, $options: "i" } },
        { brand: { $regex: safeQuery, $options: "i" } },
        { description: { $regex: safeQuery, $options: "i" } },
      ];
    }

    if (categoryName) {
      searchQuery["category.name"] = {
        $regex: escapeRegex(categoryName.trim()),
        $options: "i",
      };
    }

    if (categoryGeneric) {
      const generics =
        typeof categoryGeneric === "string"
          ? categoryGeneric.split(",").map((g) => escapeRegex(g.trim()))
          : categoryGeneric.map((g) => escapeRegex(g.trim()));
      searchQuery["category.generic"] = { $in: generics };
    }

    let priceFilter = {};
    if (!isNaN(parseFloat(minPrice))) {
      priceFilter.$gte = parseFloat(minPrice);
    }
    if (!isNaN(parseFloat(maxPrice))) {
      priceFilter.$lte = parseFloat(maxPrice);
    }
    if (Object.keys(priceFilter).length > 0) {
      searchQuery.priceAfterDiscount = priceFilter;
    }

    const sortQuery =
      sortBy === "priceAsc"
        ? { priceAfterDiscount: 1 }
        : sortBy === "priceDesc"
        ? { priceAfterDiscount: -1 }
        : sortBy === "discountPercentage"
        ? { discountPercentage: -1 }
        : {};

    // Tìm kiếm sản phẩm dựa trên tiêu chí tìm kiếm cơ bản
    let products = await Product.find(searchQuery)
      .limit(Math.max(1, parseInt(limit)))
      .sort(sortQuery);

    // Nếu không tìm thấy sản phẩm nào, thử tìm gần đúng bằng MongoDB Text Search
    if (products.length === 0 && query.trim()) {
      products = await Product.find({ $text: { $search: query.trim() } })
        .limit(Math.max(1, parseInt(limit)))
        .sort({ score: { $meta: "textScore" } });
    }

    res.json({ products });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
