//productRoutes.js
const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const Product = require("../models/productModel");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

// Cấu hình Multer để lưu trữ tạm thời các tệp trong bộ nhớ
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Kiểm tra trùng lặp sản phẩm
const checkDuplicate = async (name, brand, category) => {
  try {
    const existingProduct = await Product.findOne({ name, brand, category });
    return existingProduct;
  } catch (err) {
    throw new Error("Lỗi kiểm tra trùng lặp");
  }
};

// Thêm sản phẩm mới với hình ảnh lên Cloudinary
router.post("/products", upload.array("images", 20), async (req, res) => {
  const {
    name,
    categoryName,
    categoryGeneric,
    brand,
    description,
    originalPrice,
    discountPercentage,
    priceAfterDiscount,
    discountCode,
    stock,
    tags, // 📌 Nhận danh sách từ khóa tìm kiếm
  } = req.body;

  try {
    const duplicateProduct = await checkDuplicate(
      name,
      brand,
      categoryName,
      categoryGeneric
    );
    if (duplicateProduct) {
      return res.status(400).json({ message: "Sản phẩm này đã tồn tại." });
    }

    const imageUploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "products" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(file.buffer);
      });
    });

    const uploadResults = await Promise.all(imageUploadPromises);
    const images = uploadResults.map((result) => result.secure_url);

    const newProduct = new Product({
      name,
      category: {
        name: categoryName,
        generic: categoryGeneric,
      },
      brand,
      description,
      originalPrice,
      discountPercentage,
      priceAfterDiscount,
      discountCode,
      images,
      stock,
      remainingStock: stock,
      salesCount: 0, // 📌 Khởi tạo số lượng bán là 0
      viewCount: 0, // 📌 Khởi tạo số lượt xem là 0
      tags: tags ? tags.split(",").map((tag) => tag.trim().toLowerCase()) : [], // 📌 Lưu tags
      similarProducts: [],
    });

    await newProduct.save();
    await updateSimilarProducts(newProduct._id); // 📌 Cập nhật sản phẩm tương tự

    res.status(201).json({
      message: "Sản phẩm đã được thêm thành công",
      product: newProduct,
    });
  } catch (err) {
    console.error("Lỗi khi upload hình ảnh hoặc lưu sản phẩm:", err);
    res.status(500).json({ message: "Có lỗi xảy ra khi thêm sản phẩm" });
  }
});

// API route: GET /products
router.get("/products", async (req, res) => {
  try {
    const {
      page = 1, // Mặc định là trang đầu tiên
      limit = 9900, // Giới hạn sản phẩm tối đa
      search = "", // Từ khóa tìm kiếm
      categoryName, // Tên danh mục
      categoryGeneric, // Danh mục chung
      minPrice, // Giá tối thiểu
      maxPrice, // Giá tối đa
      sortBy = "default", // Sắp xếp
    } = req.query;

    // Kiểm tra `page` và `limit` là số nguyên dương
    const validPage = Math.max(1, parseInt(page, 10));
    const validLimit = Math.max(1, parseInt(limit, 10));

    // Xây dựng query lọc
    let query = {};

    // Tìm kiếm chung mở rộng cho nhiều trường
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "category.name": { $regex: search, $options: "i" } },
        { "category.generic": { $regex: search, $options: "i" } },
      ];
    }
    if (categoryName) {
      query["category.name"] = { $regex: categoryName, $options: "i" };
    }
    if (categoryGeneric) {
      // Split chuỗi thành mảng nếu có nhiều giá trị
      const generics =
        typeof categoryGeneric === "string"
          ? categoryGeneric.split(",")
          : categoryGeneric;

      // Thêm filter tìm chính xác giá trị trong mảng
      query["category.generic"] = { $in: generics.map((g) => g.trim()) };
    }
    let priceFilter = {};
    if (minPrice && !isNaN(minPrice)) {
      priceFilter.$gte = parseFloat(minPrice);
    }
    if (maxPrice && !isNaN(maxPrice)) {
      priceFilter.$lte = parseFloat(maxPrice);
    }
    if (Object.keys(priceFilter).length > 0) {
      query.priceAfterDiscount = priceFilter;
    }

    // Sửa phần sort random thành:
    if (sortBy === "random") {
      const matchStage = { $match: query };
      const sampleStage = { $sample: { size: parseInt(validLimit) } };
      const pipeline = [matchStage, sampleStage];

      const randomProducts = await Product.aggregate(pipeline);
      return res.json({
        products: randomProducts,
        totalPages: 1,
        currentPage: 1,
      });
    }

    // Cấu hình sắp xếp
    const sortQuery =
      sortBy === "priceAsc"
        ? { priceAfterDiscount: 1 } // Giá tăng dần
        : sortBy === "priceDesc"
        ? { priceAfterDiscount: -1 } // Giá giảm dần
        : sortBy === "discountPercentage"
        ? { discountPercentage: -1 } // Phần trăm giảm giá
        : {}; // Mặc định không sắp xếp

    // Lấy sản phẩm với query, sắp xếp và phân trang
    const products = await Product.find(query)
      .limit(validLimit)
      .skip((validPage - 1) * validLimit)
      .sort(sortQuery);
    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      products,
      totalPages: Math.ceil(totalProducts / validLimit),
      currentPage: validPage,
    });
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    res.status(500).json({ message: "Lỗi khi lấy sản phẩm." });
  }
});

// Route lấy chi tiết sản phẩm theo ID
router.get("/products/:id", async (req, res) => {
  const productId = req.params.id;

  // Validate product ID
  if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "ID sản phẩm không hợp lệ." });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    res
      .status(500)
      .json({ message: "Có lỗi xảy ra khi lấy thông tin sản phẩm." });
  }
});

// 📌 Route sửa sản phẩm (PUT)
router.put("/products/:id", upload.array("images", 20), async (req, res) => {
  const productId = req.params.id;

  // Validate product ID
  if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "ID sản phẩm không hợp lệ." });
  }

  try {
    // 🔹 1. Kiểm tra sản phẩm có tồn tại không
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }

    // 🔹 2. Xử lý dữ liệu từ request
    const categoryName = req.body["category[name]"] || req.body.category?.name;
    const categoryGeneric = req.body["category[generic]"] || req.body.category?.generic;

    const updatedProductData = {
      name: req.body.name || existingProduct.name,
      brand: req.body.brand || existingProduct.brand,
      description: req.body.description || existingProduct.description,
      originalPrice: req.body.originalPrice || existingProduct.originalPrice,
      discountPercentage: req.body.discountPercentage || existingProduct.discountPercentage,
      priceAfterDiscount: req.body.priceAfterDiscount || existingProduct.priceAfterDiscount,
      discountCode: req.body.discountCode || existingProduct.discountCode,
      remainingStock: req.body.remainingStock || existingProduct.remainingStock,
      stock: req.body.stock || existingProduct.stock,
      category: {
        name: categoryName || existingProduct.category.name,
        generic: categoryGeneric || existingProduct.category.generic,
      },
      updatedAt: Date.now(), // 📌 Cập nhật thời gian chỉnh sửa
    };

    // 🔹 3. Xử lý ảnh: Nếu có ảnh mới, xóa ảnh cũ và upload ảnh mới
    if (req.files && req.files.length > 0) {
      try {
        // Xóa ảnh cũ từ Cloudinary
        const deleteImagePromises = existingProduct.images.map((url) => {
          const publicId = url.split("/").pop().split(".")[0];
          return cloudinary.uploader.destroy(`products/${publicId}`);
        });
        await Promise.all(deleteImagePromises);

        // Upload ảnh mới lên Cloudinary
        const imageUploadPromises = req.files.map((file) => {
          return new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream({ folder: "products" }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
              })
              .end(file.buffer);
          });
        });

        const uploadResults = await Promise.all(imageUploadPromises);
        updatedProductData.images = uploadResults.map((result) => result.secure_url);
      } catch (error) {
        console.error("❌ Lỗi khi xử lý hình ảnh:", error);
        return res.status(500).json({ message: "Lỗi khi xử lý hình ảnh." });
      }
    }

    // 🔹 4. Cập nhật sản phẩm
    const updatedProduct = await Product.findByIdAndUpdate(productId, updatedProductData, { new: true });

    res.status(200).json({
      message: "✅ Sản phẩm đã được cập nhật thành công.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi cập nhật sản phẩm." });
  }
});

// 📌 Route xóa sản phẩm (DELETE)
router.delete("/products/:id", async (req, res) => {
  const productId = req.params.id;

  // Kiểm tra nếu ID không hợp lệ
  if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "ID sản phẩm không hợp lệ." });
  }

  try {
    // 🔹 1. Kiểm tra sản phẩm có tồn tại không
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }

    // 🔹 2. Kiểm tra sản phẩm có trong đơn hàng không
    const ordersWithProduct = await Order.findOne({ "items.product": productId });
    if (ordersWithProduct) {
      return res.status(400).json({ message: "Không thể xóa sản phẩm có trong đơn hàng." });
    }

    // 🔹 3. Xóa ảnh sản phẩm từ Cloudinary
    if (existingProduct.images.length > 0) {
      try {
        const deleteImagePromises = existingProduct.images.map((url) => {
          const publicId = url.split("/").pop().split(".")[0];
          return cloudinary.uploader.destroy(`products/${publicId}`);
        });
        await Promise.all(deleteImagePromises);
      } catch (error) {
        console.error("❌ Lỗi khi xóa ảnh từ Cloudinary:", error);
      }
    }

    // 🔹 4. Xóa sản phẩm
    await Product.findByIdAndDelete(productId);

    res.status(200).json({ message: "✅ Sản phẩm đã được xóa thành công." });
  } catch (error) {
    console.error("❌ Lỗi khi xóa sản phẩm:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi xóa sản phẩm." });
  }
});

router.post("/products/:id/purchase", async (req, res) => {
  const productId = req.params.id;
  const { quantity } = req.body;

  try {
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Số lượng mua không hợp lệ." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại." });
    }

    if (product.remainingStock < quantity) {
      return res.status(400).json({ message: "Số lượng trong kho không đủ." });
    }
    product.remainingStock -= quantity;

    await product.save();

    res.status(200).json({
      message: "Mua hàng thành công",
      product,
    });
  } catch (err) {
    console.error("Lỗi khi cập nhật số lượng sản phẩm:", err);
    res.status(500).json({ message: "Có lỗi xảy ra khi mua hàng." });
  }
});

router.get("/products/related", async (req, res) => {
  const { generic, limit } = req.query;

  if (!generic) {
    return res.status(400).json({ message: "Thiếu tham số 'generic'" });
  }
  const numLimit = Number(limit) || 6;

  try {
    const products = await Product.find({
      "category.generic": { $regex: generic, $options: "i" },
    }).limit(numLimit);

    return res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching related products:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi lấy sản phẩm liên quan" });
  }
});



// Route POST thêm review cho sản phẩm
router.post("/products/:productId/reviews", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, reviewText } = req.body;
    const userId = req.user._id;

    // Kiểm tra rating hợp lệ (1 - 5)
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Số sao không hợp lệ" });
    }

    // Tìm sản phẩm theo productId và populate reviews.userId để có thông tin người dùng
    const product = await Product.findById(productId).populate("reviews.userId", "firstName lastName");
    if (!product) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    // Lấy thông tin người dùng để kiểm tra (populate chỉ dùng để hiển thị, không lưu tên vào model)
    const user = await User.findById(userId).select("firstName lastName");
    if (!user) {
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
    }

    // Thêm review vào mảng reviews (chỉ lưu userId theo cấu trúc hiện có)
    product.reviews.push({
      userId,
      reviewText,
      rating,
    });

    // Tính lại điểm trung bình của sản phẩm
    const totalRatings = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating = totalRatings / product.reviews.length;

    // Lưu thay đổi vào CSDL
    await product.save();

    // Lấy lại sản phẩm với populate đầy đủ thông tin review
    const updatedProduct = await Product.findById(productId).populate("reviews.userId", "firstName lastName");
    return res.json({
      success: true,
      product: updatedProduct,
      message: "Đánh giá đã được gửi thành công",
    });
  } catch (error) {
    console.error("Error adding review:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// Route GET lấy thông tin sản phẩm theo productId
router.get("/products/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate("reviews.userId", "firstName lastName");
    if (!product) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

// Route tìm kiếm sản phẩm
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

    // Tìm kiếm theo từ khóa query
    if (query.trim()) {
      const safeQuery = escapeRegex(query.trim());
      searchQuery.$or = [
        { name: { $regex: safeQuery, $options: "i" } },
        { brand: { $regex: safeQuery, $options: "i" } },
        { description: { $regex: safeQuery, $options: "i" } },
      ];
    }

    // Các bộ lọc thêm: thể loại, giá cả, v.v.
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

    // Bộ lọc giá
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

    // Truy vấn cơ sở dữ liệu với bộ lọc tìm kiếm
    let products = await Product.find(searchQuery)
      .limit(Math.max(1, parseInt(limit)))
      .sort(sortQuery);

    // Nếu không có kết quả, thử sử dụng tìm kiếm văn bản như một phương pháp dự phòng
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
