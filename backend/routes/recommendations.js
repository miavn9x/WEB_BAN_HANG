const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/authMiddleware");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const ViewHistory = require("../models/ViewHistory");
const SearchHistory = require("../models/SearchHistory");
const Cart = require("../models/cartModel");

const groupConfig = {
  cart: { enabled: true, weight: 1.5, slice: 15 },
  search: { enabled: true, weight: 1.0, slice: 15 },
  view: { enabled: true, weight: 1.0, slice: 15 },
  order: { enabled: true, weight: 1.0, slice: 15 },
  sale: { enabled: true, weight: 1.0, slice: 3 },
  revenue: { enabled: true, weight: 1.2, slice: 3 },
};

// -------------------- Group 1: Giỏ hàng --------------------
async function getCartScores(userId) {
  const scores = {};
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (cart && cart.items && cart.items.length > 0) {
    cart.items.forEach((item) => {
      const product = item.product;
      const quantity = item.quantity || 1;
      if (product && product.category) {
        if (product.category.name) {
          const catName = product.category.name;
          scores[catName] = (scores[catName] || 0) + 7 * quantity;
        }
        if (product.category.generic) {
          const generic = product.category.generic;
          scores[generic] = (scores[generic] || 0) + 3 * quantity;
        }
      }
      if (product && product.brand) {
        const brand = product.brand;
        scores[brand] = (scores[brand] || 0) + 2 * quantity;
      }
    });
  }
  return { scores, cart };
}

// -------------------- Group 2: Tìm kiếm --------------------
async function getSearchScores(userId) {
  const searchHistory = await SearchHistory.findOne({ user: userId });
  if (!searchHistory || !Array.isArray(searchHistory.searches))
    return { matchedProducts: [] };

  function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }

  const productMatches = {};
  for (const search of searchHistory.searches) {
    if (!search.query) continue;
    const queryTrim = search.query.trim();
    if (!queryTrim) continue;
    const safeQuery = escapeRegex(queryTrim);
    const searchQuery = {
      $or: [
        { name: { $regex: safeQuery, $options: "i" } },
        { brand: { $regex: safeQuery, $options: "i" } },
        { description: { $regex: safeQuery, $options: "i" } },
      ],
    };
    const products = await Product.find(searchQuery)
      .collation({ locale: "vi", strength: 1 })
      .limit(10)
      .lean();
    products.forEach((product) => {
      if (productMatches[product._id]) {
        productMatches[product._id].score += 3;
      } else {
        productMatches[product._id] = { ...product, score: 3 };
      }
    });
  }
  const matchedProducts = Object.values(productMatches).sort(
    (a, b) => b.score - a.score
  );
  return { matchedProducts };
}

// -------------------- Group 3: Lịch sử xem --------------------
async function getViewHistoryScores(userId) {
  const scores = {};
  const viewHistory = await ViewHistory.findOne({ user: userId }).populate(
    "products.product"
  );
  if (viewHistory && viewHistory.products && viewHistory.products.length > 0) {
    viewHistory.products.forEach((item) => {
      const product = item.product;
      if (product && product.category) {
        if (product.category.name) {
          const catName = product.category.name;
          scores[catName] = (scores[catName] || 0) + 3.5;
        }
        if (product.category.generic) {
          const generic = product.category.generic;
          scores[generic] = (scores[generic] || 0) + 1.5;
        }
      }
      if (product && product.brand) {
        const brand = product.brand;
        scores[brand] = (scores[brand] || 0) + 0.5;
      }
    });
  }
  return scores;
}

// -------------------- Group 4: Lịch sử thanh toán --------------------
async function getOrderScores(userId) {
  const scores = {};
  const orders = await Order.find({ userId: userId }).populate("items.product");
  const purchasedProducts = orders.flatMap((order) =>
    order.items.map((item) => item.product)
  );
  if (purchasedProducts && purchasedProducts.length > 0) {
    purchasedProducts.forEach((product) => {
      if (product && product.category) {
        if (product.category.name) {
          const catName = product.category.name;
          scores[catName] = (scores[catName] || 0) + 14;
        }
        if (product.category.generic) {
          const generic = product.category.generic;
          scores[generic] = (scores[generic] || 0) + 6;
        }
      }
    });
  }
  return { scores, purchasedProducts };
}

// -------------------- Hàm gợi ý tổng hợp --------------------
async function getGroupRecommendations(userId) {
  // Thu thập dữ liệu từ 4 nguồn chính cùng lúc
  const [cartData, searchScores, viewScores, orderData] = await Promise.all([
    getCartScores(userId),
    getSearchScores(userId),
    getViewHistoryScores(userId),
    getOrderScores(userId),
  ]);

  // --- Group 1: Giỏ hàng ---
  let recommendedCart = [];
  if (groupConfig.cart.enabled && Object.keys(cartData.scores).length > 0) {
    const keys = Object.keys(cartData.scores);
    const productsByKey = await Promise.all(
      keys.map((key) =>
        Product.find({
          $or: [
            { "category.generic": key },
            { brand: key },
            { name: { $regex: key, $options: "i" } },
          ],
        }).limit(10)
      )
    );
    let mapCart = {};
    keys.forEach((key, i) => {
      productsByKey[i].forEach((product) => {
        if (mapCart[product._id]) {
          mapCart[product._id].score += cartData.scores[key];
        } else {
          mapCart[product._id] = {
            ...product._doc,
            score: cartData.scores[key],
          };
        }
      });
    });
    recommendedCart = Object.values(mapCart);

    // Loại bỏ các sản phẩm đã có trong giỏ hàng
    if (
      cartData.cart &&
      cartData.cart.items &&
      cartData.cart.items.length > 0
    ) {
      const cartProductIds = new Set(
        cartData.cart.items.map((item) => item.product._id.toString())
      );
      recommendedCart = recommendedCart.filter(
        (p) => !cartProductIds.has(p._id.toString())
      );
    }

    // So sánh giá của sản phẩm trong giỏ để điều chỉnh điểm
    if (
      cartData.cart &&
      cartData.cart.items &&
      cartData.cart.items.length > 0 &&
      cartData.cart.items[0].product
    ) {
      const refPrice = cartData.cart.items[0].product.priceAfterDiscount;
      recommendedCart.forEach((p) => {
        p.priceDifference = Math.abs(p.priceAfterDiscount - refPrice);
        p.score += 10 - p.priceDifference / 1000;
      });
    }
    // Cộng thêm điểm theo rating và recency
    recommendedCart.forEach((p) => {
      if (p.rating) p.score += p.rating * 0.5;
      const daysSinceUpdate =
        (new Date() - new Date(p.updatedAt)) / (1000 * 3600 * 24);
      p.score += Math.max(0, 5 - daysSinceUpdate * 0.1);
      p.score *= groupConfig.cart.weight;
    });
    recommendedCart.sort((a, b) => b.score - a.score);
    recommendedCart = recommendedCart.slice(0, groupConfig.cart.slice);
    recommendedCart.forEach((p) => (p.group = 1));
  }

  // --- Group 2: Tìm kiếm ---
  let recommendedSearch = [];
  if (
    groupConfig.search.enabled &&
    searchScores &&
    searchScores.matchedProducts &&
    searchScores.matchedProducts.length > 0
  ) {
    recommendedSearch = searchScores.matchedProducts;
    recommendedSearch.forEach((p) => {
      p.score *= groupConfig.search.weight;
      p.group = 2;
    });
    recommendedSearch = recommendedSearch.slice(0, groupConfig.search.slice);
  }

  // --- Group 3: Lịch sử xem ---
  let recommendedView = [];
  if (groupConfig.view.enabled && Object.keys(viewScores).length > 0) {
    const keys = Object.keys(viewScores);
    const productsByKey = await Promise.all(
      keys.map((key) =>
        Product.find({
          $or: [
            { "category.generic": key },
            { brand: key },
            { name: { $regex: key, $options: "i" } },
          ],
        }).limit(10)
      )
    );
    let mapView = {};
    keys.forEach((key, i) => {
      productsByKey[i].forEach((product) => {
        if (mapView[product._id]) {
          mapView[product._id].score += viewScores[key];
        } else {
          mapView[product._id] = { ...product._doc, score: viewScores[key] };
        }
      });
    });
    recommendedView = Object.values(mapView);
    recommendedView.sort((a, b) => b.score - a.score);
    recommendedView.forEach((p) => {
      p.score *= groupConfig.view.weight;
      p.group = 3;
    });
    recommendedView = recommendedView.slice(0, groupConfig.view.slice);
  }

  // --- Group 4: Lịch sử thanh toán ---
  let recommendedOrder = [];
  if (groupConfig.order.enabled && Object.keys(orderData.scores).length > 0) {
    const keys = Object.keys(orderData.scores);
    const productsByKey = await Promise.all(
      keys.map((key) =>
        Product.find({
          "category.generic": { $exists: true, $ne: "" },
          $or: [
            { "category.generic": key },
            { brand: key },
            { name: { $regex: key, $options: "i" } },
          ],
        }).limit(10)
      )
    );
    let mapOrder = {};
    keys.forEach((key, i) => {
      productsByKey[i].forEach((product) => {
        if (mapOrder[product._id]) {
          mapOrder[product._id].score += orderData.scores[key];
        } else {
          mapOrder[product._id] = {
            ...product._doc,
            score: orderData.scores[key],
          };
        }
      });
    });
    recommendedOrder = Object.values(mapOrder);
    if (orderData.purchasedProducts && orderData.purchasedProducts.length > 0) {
      const refPrice = orderData.purchasedProducts[0].priceAfterDiscount;
      recommendedOrder.forEach((p) => {
        p.priceDifference = Math.abs(p.priceAfterDiscount - refPrice);
        p.score += 10 - p.priceDifference / 1000;
      });
    }
    recommendedOrder.sort((a, b) => b.score - a.score);
    recommendedOrder.forEach((p) => {
      p.score *= groupConfig.order.weight;
      p.group = 4;
    });
    recommendedOrder = recommendedOrder.slice(0, groupConfig.order.slice);
  }

  // -------------------- Tính số lượng nguồn dữ liệu chính --------------------
  const primaryGroups = [
    recommendedCart,
    recommendedSearch,
    recommendedView,
    recommendedOrder,
  ];
  let primaryDataCount = primaryGroups.reduce(
    (acc, group) => acc + (group && group.length > 0 ? 1 : 0),
    0
  );

  // -------------------- Áp dụng điều kiện hiển thị Sale và Doanh thu cao --------------------
  // Nếu số nguồn dữ liệu chính nhỏ hơn 3, hiển thị thêm nhóm Sale (Group 5) và Doanh thu cao (Group 6)
  // Ngược lại (>=3), ẩn 2 nhóm này.
  let recommendedSale = [];
  let recommendedHighRevenue = [];
  if (primaryDataCount < 3) {
    // --- Group 5: Sản phẩm Sale >10% ---
    if (groupConfig.sale.enabled) {
      recommendedSale = await Product.find({
        discountPercentage: { $gt: 10 },
      })
        .sort({ discountPercentage: -1 })
        .limit(50)
        .lean();
      recommendedSale.forEach((p) => {
        p.score = p.discountPercentage * groupConfig.sale.weight;
        p.group = 5;
      });
      recommendedSale = recommendedSale.slice(0, groupConfig.sale.slice);
    }

    // --- Group 6: Sản phẩm doanh thu cao ---
    if (groupConfig.revenue.enabled) {
      try {
        const startOfMonth = new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        );
        const monthlySalesAggregation = await Order.aggregate([
          { $match: { createdAt: { $gte: startOfMonth } } },
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.product",
              totalSold: { $sum: "$items.quantity" },
            },
          },
          { $sort: { totalSold: -1 } },
        ]);
        const totalSoldOverall = monthlySalesAggregation.reduce(
          (acc, curr) => acc + curr.totalSold,
          0
        );
        const highRevenueAgg = monthlySalesAggregation.filter(
          (item) => item.totalSold / totalSoldOverall > 0.1
        );
        const productsArr = await Promise.all(
          highRevenueAgg.map((agg) => Product.findById(agg._id).lean())
        );
        productsArr.forEach((product, idx) => {
          if (product) {
            recommendedHighRevenue.push({
              ...product,
              totalSold: highRevenueAgg[idx].totalSold,
            });
          }
        });
        recommendedHighRevenue.sort((a, b) => b.totalSold - a.totalSold);
        recommendedHighRevenue.forEach((p) => {
          p.score = (p.totalSold || 0) * groupConfig.revenue.weight;
          p.group = 6;
        });
        recommendedHighRevenue = recommendedHighRevenue.slice(
          0,
          groupConfig.revenue.slice
        );
      } catch (error) {
        // Nếu có lỗi, bỏ qua
      }
    }
  }

  // -------------------- Lọc trùng lặp giữa các nhóm --------------------
  const seenIds = new Set();
  const filterDuplicates = (products) =>
    products.filter((p) => {
      if (seenIds.has(p._id.toString())) return false;
      seenIds.add(p._id.toString());
      return true;
    });

  recommendedCart = filterDuplicates(recommendedCart);
  recommendedSearch = filterDuplicates(recommendedSearch);
  recommendedView = filterDuplicates(recommendedView);
  recommendedOrder = filterDuplicates(recommendedOrder);
  recommendedSale = filterDuplicates(recommendedSale);
  recommendedHighRevenue = filterDuplicates(recommendedHighRevenue);

  // Gộp các sản phẩm từ từng nhóm vào mảng duy nhất
  let allProducts = [
    ...recommendedCart,
    ...recommendedSearch,
    ...recommendedView,
    ...recommendedOrder,
    ...recommendedSale,
    ...recommendedHighRevenue,
  ];

  // -------------------- Điều kiện bổ sung: Điều chỉnh điểm cho sản phẩm --------------------
  allProducts.forEach((p) => {
    // Nếu sản phẩm hết hàng, giảm điểm mạnh để ưu tiên các sản phẩm còn hàng
    if (p.inStock !== undefined && p.inStock <= 0) {
      p.score -= 50;
    }
    // Nếu rating thấp (< 3), giảm điểm
    if (p.rating && p.rating < 3) {
      p.score -= 10;
    }
    // Có thể bổ sung thêm điều kiện điều chỉnh điểm theo khoảng giá trung bình từ lịch sử mua hàng...
  });

  // Sắp xếp cuối cùng theo nhóm (nếu cần) và theo điểm số
  allProducts.sort((a, b) => {
    if (a.group !== b.group) return a.group - b.group;
    return b.score - a.score;
  });

  return {
    recommendedCart,
    recommendedSearch,
    recommendedView,
    recommendedOrder,
    recommendedSale,
    recommendedHighRevenue,
    allProducts,
  };
}

// -------------------- Route chính --------------------
router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user._id;
  try {
    const recommendations = await getGroupRecommendations(userId);
    res.status(200).json({ recommendations });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách đề xuất." });
  }
});

module.exports = router;
