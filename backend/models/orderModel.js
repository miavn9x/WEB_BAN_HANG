const mongoose = require("mongoose");
const {
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
} = require("../constants/orderConstants");

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
      enum: Object.values(PAYMENT_METHODS), 
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS), 
      default: PAYMENT_STATUS.PENDING,
    },
    orderStatus: {
      type: String,
      enum: Object.values(ORDER_STATUS), 
      default: ORDER_STATUS.PROCESSING,
    },
    userInfo: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      email: { type: String, required: true },
    },
    orderDate: {
      type: Date,
      default: Date.now,
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
  }
);

orderSchema.post("save", function (error, doc, next) {
  if (error.name === "ValidationError") {
    console.log("Validation Error:", error);
  }
  next(error);
});

module.exports = mongoose.model("Order", orderSchema);
