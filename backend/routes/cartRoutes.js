const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const router = express.Router();

// Route thêm sản phẩm vào giỏ hàng
router.post("/cart", authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  if (quantity <= 0) {
    return res.status(400).json({ message: "Số lượng phải lớn hơn 0" });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    if (quantity > product.remainingStock) {
      return res
        .status(400)
        .json({ message: "Số lượng vượt quá hàng tồn kho" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity }],
      });
      await cart.save();
    } else {
      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (existingItemIndex !== -1) {
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        if (newQuantity > product.remainingStock) {
          return res.status(400).json({ message: "Vượt quá tồn kho" });
        }
        cart.items[existingItemIndex].quantity = newQuantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
      await cart.save();
    }

    res.status(200).json({ message: "Sản phẩm đã được thêm vào giỏ hàng." });
  } catch (err) {
    console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", err);
    res
      .status(500)
      .json({ message: "Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng." });
  }
});

// Xóa sản phẩm khỏi giỏ hàng
router.delete("/cart/:productId", authMiddleware, async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    if (cart.items.length === 0) {
      await Cart.deleteOne({ user: userId });
      return res.status(200).json({ message: "Giỏ hàng đã được xóa." });
    }

    await cart.save();
    res.status(200).json({ message: "Sản phẩm đã được xóa khỏi giỏ hàng." });
  } catch (err) {
    console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", err);
    res
      .status(500)
      .json({ message: "Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng." });
  }
});

// Route lấy danh sách sản phẩm trong giỏ hàng
router.get("/cart", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({ message: "Giỏ hàng rỗng", items: [] });
    }

    res.status(200).json({ items: cart.items });
  } catch (err) {
    console.error("Lỗi khi lấy giỏ hàng:", err);
    res.status(500).json({ message: "Có lỗi xảy ra khi lấy giỏ hàng." });
  }
});

// Route cập nhật số lượng sản phẩm trong giỏ
router.put("/cart/:productId", authMiddleware, async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const userId = req.user.id;

  if (quantity <= 0) {
    return res.status(400).json({ message: "Số lượng phải lớn hơn 0" });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }

    if (quantity > product.remainingStock) {
      return res
        .status(400)
        .json({ message: "Số lượng vượt quá hàng tồn kho" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    res.status(200).json({ message: "Cập nhật số lượng thành công", cart });
  } catch (err) {
    console.error("Lỗi khi cập nhật số lượng sản phẩm:", err);
    res
      .status(500)
      .json({ message: "Có lỗi xảy ra khi cập nhật số lượng sản phẩm." });
  }
});

// Xóa nhiều sản phẩm khỏi giỏ hàng
router.delete("/cart", authMiddleware, async (req, res) => {
  const { productIds } = req.body;
  const userId = req.user.id;

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }

    cart.items = cart.items.filter(
      (item) => !productIds.includes(item.product.toString())
    );

    if (cart.items.length === 0) {
      await Cart.deleteOne({ user: userId });
      return res.status(200).json({ message: "Giỏ hàng đã được xóa." });
    }

    await cart.save();
    res
      .status(200)
      .json({
        message: "Các sản phẩm đã được xóa khỏi giỏ hàng.",
        items: cart.items,
      });
  } catch (err) {
    console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", err);
    res
      .status(500)
      .json({ message: "Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng." });
  }
});

module.exports = router;
