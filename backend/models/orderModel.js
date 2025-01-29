// orderModel.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        name: { type: String, required: true },
        image: { type: String },
      },
    ],
    totalAmount: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cod", "bank"],
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["Chưa thanh toán", "Đợi xác nhận", "Đã thanh toán"],
      default: "Chưa thanh toán",
    },
    userInfo: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      email: { type: String, required: true },
    },
    orderStatus: {
      type: String,
      required: true,
      enum: [
        "Đang xử lý",
        "Đã xác nhận",
        "Đang giao hàng",
        "Đã giao hàng",
        "Đã hủy",
      ],
      default: "Đang xử lý",
    },
    orderDate: {
      type: Date,
      default: Date.now,
      get: function (date) {
        return date
          ? date.toLocaleString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })
          : null;
      },
    },
    formattedOrderDate: {
      type: String,
      default: function () {
        return new Date().toLocaleString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
      },
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

module.exports = mongoose.model("Order", orderSchema);
