const nodemailer = require("nodemailer");
const { PAYMENT_METHOD_LABELS } = require("../constants/orderConstants");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOrderConfirmationEmail = async (orderDetails, userEmail) => {
  const paymentLabel =
    PAYMENT_METHOD_LABELS[orderDetails.paymentMethod] || "Không xác định";

  const paymentStatusLabel =
    orderDetails.paymentMethod === "bank"
      ? "Chờ xác nhận"
      : orderDetails.paymentStatus;

  const itemsList = orderDetails.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; text-align: left; border: 1px solid #ddd;">${
          item.name
        }</td>
        <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">${
          item.quantity
        }</td>
        <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">${item.price.toLocaleString(
          "vi-VN"
        )}đ</td>
      </tr>
    `
    )
    .join("");

  const bankingInfo =
    orderDetails.paymentMethod === "bank"
      ? `
        <div style="background-color: #e9f7ef; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p style="font-size: 16px;">Vui lòng chuyển khoản đến:</p>
          <p><strong>Ngân hàng XYZ</strong> - Số tài khoản: 1234567890</p>
        </div>
      `
      : "";

  const emailTemplate = `
    <div style="font-family: 'Arial', sans-serif; max-width: 650px; margin: 0 auto; padding: 20px;">
      <h2 style="text-align: center;">Xác nhận đơn hàng #${
        orderDetails.orderId
      }</h2>
      <p>Xin chào <strong>${orderDetails.userInfo.fullName}</strong>,</p>
      <p>Cảm ơn bạn đã đặt hàng. Dưới đây là chi tiết đơn hàng:</p>
      
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd;">Sản phẩm</th>
            <th style="border: 1px solid #ddd;">Số lượng</th>
            <th style="border: 1px solid #ddd;">Giá</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
      </table>

      <p><strong>Tổng tiền hàng:</strong> ${orderDetails.subtotal.toLocaleString(
        "vi-VN"
      )}đ</p>
      <p><strong>Phí vận chuyển:</strong> ${orderDetails.shippingFee.toLocaleString(
        "vi-VN"
      )}đ</p>
      <p><strong>Tổng cộng:</strong> ${orderDetails.totalAmount.toLocaleString(
        "vi-VN"
      )}đ</p>

      <h3>Thông tin giao hàng</h3>
      <p>Người nhận: ${orderDetails.userInfo.fullName}</p>
      <p>Số điện thoại: ${orderDetails.userInfo.phone}</p>
      <p>Địa chỉ: ${orderDetails.userInfo.address}</p>
      <p><strong>Thời gian đặt hàng:</strong> ${
        orderDetails.formattedOrderDate
      }</p>

      <p><strong>Phương thức thanh toán:</strong> ${paymentLabel}</p>
      <p><strong>Trạng thái thanh toán:</strong> ${paymentStatusLabel}</p>

      ${bankingInfo}

      <p style="text-align: center;">
        <a href="http://localhost:3000/OrderHistory" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none;">Xem lại đơn hàng</a>
      </p>

      <p style="text-align: center;">Cảm ơn bạn đã mua hàng!</p>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `Xác nhận đơn hàng #${orderDetails.orderId}`,
    html: emailTemplate,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email xác nhận đơn hàng đã gửi thành công!");
  } catch (error) {
    console.error("❌ Lỗi khi gửi email:", error);
    throw error;
  }
};

module.exports = { sendOrderConfirmationEmail };
