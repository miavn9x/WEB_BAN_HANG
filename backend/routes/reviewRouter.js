// // routes/reviewRouter.js
// const express = require("express");
// const router = express.Router();
// const Product = require("../models/productModel");

// // Endpoint: POST /api/products/:productId/reviews
// router.post("/:productId/reviews", async (req, res) => {
//   try {
//     const { productId } = req.params;
//     let { userId, reviewText, rating } = req.body;

//     // Kiểm tra các trường bắt buộc
//     if (!userId) {
//       return res.status(400).json({ error: "User ID is required." });
//     }
//     // Ép kiểu rating về Number và kiểm tra giá trị
//     rating = Number(rating);
//     if (!rating || rating < 1 || rating > 5) {
//       return res
//         .status(400)
//         .json({ error: "Rating must be a number between 1 and 5." });
//     }

//     // Tìm sản phẩm theo productId
//     const product = await Product.findById(productId);
//     if (!product) return res.status(404).json({ error: "Product not found" });

//     // Tạo đối tượng review và thêm vào mảng reviews của sản phẩm
//     const review = { userId, reviewText, rating };
//     product.reviews.push(review);

//     // Tính tổng và trung bình rating của sản phẩm
//     const totalRatings = product.reviews.reduce(
//       (acc, curr) => acc + curr.rating,
//       0
//     );
//     product.rating = totalRatings / product.reviews.length;

//     // Lưu lại sản phẩm sau khi cập nhật
//     await product.save();
//     res.status(201).json({ message: "Review added successfully", product });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Endpoint: GET /api/products/:productId/reviews
// router.get("/:productId/reviews", async (req, res) => {
//   try {
//     const { productId } = req.params;

//     // Tìm sản phẩm theo productId và populate reviews với thông tin người dùng
//     const product = await Product.findById(productId).populate(
//       "reviews.userId",
//       "firstName lastName email"
//     );
//     if (!product) return res.status(404).json({ error: "Product not found" });

//     // Trả về danh sách review của sản phẩm
//     res.json(product.reviews);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// module.exports = router;
