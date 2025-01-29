// constants/orderConstants.js
exports.ORDER_STATUS = {
  PROCESSING: "Đang xử lý",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao hàng",
  DELIVERED: "Đã giao hàng",
  CANCELLED: "Đã hủy", // Thêm trạng thái "Đã hủy"
};

exports.PAYMENT_METHODS = {
  COD: "cod",
  BANK: "bank",
};

exports.PAYMENT_METHOD_LABELS = {
  cod: "Thanh toán khi nhận hàng",
  bank: "Thanh toán ngân hàng",
};
