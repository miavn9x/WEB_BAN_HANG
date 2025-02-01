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
  CONFIRMING: "Đã xác nhận", // Sửa lại để khớp với dữ liệu
  COMPLETED: "Đã thanh toán",
};

exports.PAYMENT_METHODS = {
  COD: "cod",
  BANK: "bank",
};
