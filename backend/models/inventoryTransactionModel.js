const mongoose = require("mongoose");

const inventoryTransactionSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  type: { type: String, enum: ["import", "sale"], required: true },
  quantity: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model(
  "InventoryTransaction",
  inventoryTransactionSchema
);
