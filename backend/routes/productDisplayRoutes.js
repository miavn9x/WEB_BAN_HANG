//productDisplayRoutes.js
const express = require("express");
const Product = require("../models/productModel");
const router = express.Router();

router.get('/api/products', async (req, res) => {
  try {
    const { price, categories, sortBy, limit } = req.query;

    let filters = {};
    if (price) {
      filters.price = { $lte: price }; 
    }
    if (categories) {
      filters.categories = { $in: categories.split(',') }; 
    }

    let sort = {};
    if (sortBy === 'priceAsc') {
      sort.price = 1; // Giá tăng dần
    } else if (sortBy === 'priceDesc') {
      sort.price = -1; // Giá giảm dần
    } else if (sortBy === 'discountPercentage') {
      sort.discountPercentage = -1; 
    }
    const products = await Product.find(filters)
      .sort(sort)
      .limit(parseInt(limit));

    res.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Server error');
  }
});

router.get('/api/products/discounts', async (req, res) => {
  try {
    const discountedProducts = await Product.find({ discountPercentage: { $gt: 0 } });

    res.json({ products: discountedProducts });
  } catch (error) {
    console.error('Error fetching discounted products:', error);
    res.status(500).send('Server error');
  }
});
module.exports = router;
