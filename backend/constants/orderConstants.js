// constants/orderConstants.js
exports.ORDER_STATUS = {
  PROCESSING: "Đang xử lý",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao hàng",
  DELIVERED: "Đã giao hàng",
  CANCELLED: "Đã hủy",
};

exports.PAYMENT_STATUS = {
  PENDING: "Chưa thanh toán",
  CONFIRMING: "Chờ xác nhận", // Đổi từ "Đã xác nhận" thành "Chờ xác nhận"
  COMPLETED: "Đã thanh toán",
};

exports.PAYMENT_METHODS = {
  COD: "cod",
  BANK: "bank",
};

exports.PAYMENT_METHOD_LABELS = {
  cod: "Thanh toán khi nhận hàng",
  bank: "Chuyển khoản ngân hàng",
};
