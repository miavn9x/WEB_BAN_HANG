// routes/reviewRouter.js
const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");

// Endpoint: POST /api/products/:productId/reviews
router.post("/:productId/reviews", async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId, reviewText, rating } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const review = { userId, reviewText, rating };
    product.reviews.push(review);

    const totalRatings = product.reviews.reduce(
      (acc, curr) => acc + curr.rating,
      0
    );
    product.rating = totalRatings / product.reviews.length;

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: GET /api/products/:productId/reviews
router.get("/:productId/reviews", async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).populate(
      "reviews.userId",
      "firstName lastName email"
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product.reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
