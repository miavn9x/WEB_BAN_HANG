const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const ViewHistory = require("../models/ViewHistory");
const SearchHistory = require("../models/SearchHistory");

router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  console.log(`📌 User ID: ${userId}`);

  try {
    let productScores = {}; // Lưu điểm số sản phẩm
    let recommendedProducts = [];

    // 🔹 1. Lấy sản phẩm từ lịch sử mua hàng và cộng điểm
    const orders = await Order.find({ userId }).populate("items.product");
    const purchasedProducts = orders.flatMap((order) =>
      order.items.map((item) => item.product)
    );

    purchasedProducts.forEach((product) => {
      if (product.category && product.category.generic) {
        const generic = product.category.generic;
        productScores[generic] = (productScores[generic] || 0) + 5; // +5 điểm nếu cùng generic với sản phẩm đã mua
      }
    });

    // 🔹 2. Lấy sản phẩm từ lịch sử xem và cộng điểm
    const viewHistory = await ViewHistory.findOne({ user: userId }).populate(
      "products.product"
    );
    if (viewHistory) {
      viewHistory.products.forEach((item) => {
        if (item.product.category && item.product.category.generic) {
          const generic = item.product.category.generic;
          productScores[generic] = (productScores[generic] || 0) + 3; // +3 điểm nếu cùng generic với sản phẩm đã xem
        }
        if (item.product.brand) {
          const brand = item.product.brand;
          productScores[brand] = (productScores[brand] || 0) + 2; // +2 điểm nếu cùng thương hiệu
        }
      });
    }

    // 🔹 3. Lấy sản phẩm từ lịch sử tìm kiếm và cộng điểm
    const searchHistory = await SearchHistory.findOne({ user: userId });
    if (searchHistory) {
      searchHistory.searches.forEach((search) => {
        productScores[search.query] = (productScores[search.query] || 0) + 1; // +1 điểm nếu có chứa từ khóa đã tìm kiếm
      });
    }

    // 🔹 4. Lọc các sản phẩm phù hợp theo tổng điểm số
    let scoredProducts = [];
    for (const key in productScores) {
      let products = await Product.find({
        $or: [
          { "category.generic": key },
          { brand: key },
          { name: { $regex: key, $options: "i" } },
        ],
      }).limit(10);

      products.forEach((product) => {
        scoredProducts.push({ ...product._doc, score: productScores[key] });
      });
    }

    // 🔹 5. Ưu tiên sản phẩm có mức giá gần với sản phẩm đã mua hoặc tìm kiếm
    if (purchasedProducts.length > 0 || searchHistory?.searches.length > 0) {
      const referencePrice =
        purchasedProducts.length > 0
          ? purchasedProducts[0].priceAfterDiscount
          : searchHistory?.searches[0]?.priceAfterDiscount || 0;

      scoredProducts.forEach((product) => {
        product.priceDifference = Math.abs(
          product.priceAfterDiscount - referencePrice
        );
        product.score += 10 - product.priceDifference / 1000; // Tăng điểm nếu giá gần với sản phẩm đã mua/tìm kiếm
      });
    }

    // 🔹 6. Nếu không có dữ liệu lịch sử, đề xuất sản phẩm bán chạy nhất
    if (scoredProducts.length === 0) {
      let popularProducts = await Product.find()
        .sort({ salesCount: -1 })
        .limit(10);
      popularProducts.forEach((product) => {
        scoredProducts.push({ ...product._doc, score: 10 }); // Gán 10 điểm cho sản phẩm bán chạy nhất
      });
    }

    // 🔹 7. Nếu vẫn không có sản phẩm, đề xuất sản phẩm mới nhất
    if (scoredProducts.length === 0) {
      let newProducts = await Product.find().sort({ createdAt: -1 }).limit(10);
      newProducts.forEach((product) => {
        scoredProducts.push({ ...product._doc, score: 5 }); // Gán 5 điểm cho sản phẩm mới nhất
      });
    }

    // 🔹 8. Sắp xếp sản phẩm theo điểm số từ cao xuống thấp
    scoredProducts.sort((a, b) => b.score - a.score);
    recommendedProducts = scoredProducts.slice(0, 10);

    res.status(200).json({ recommendations: recommendedProducts });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách đề xuất:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách đề xuất." });
  }
});

module.exports = router;
