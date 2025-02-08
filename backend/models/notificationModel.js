const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Người nhận thông báo
  title: { type: String, required: true }, // Tiêu đề thông báo (ví dụ: "Cập nhật đơn hàng")
  message: { type: String, required: true }, // Nội dung thông báo
  order: { type: Schema.Types.ObjectId, ref: "Order", default: null }, // Nếu thông báo liên quan đến đơn hàng nào đó
  read: { type: Boolean, default: false }, // Đánh dấu đã đọc hay chưa
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
