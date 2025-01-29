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
  const itemsList = orderDetails.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; text-align: left; border: 1px solid #ddd; background-color: #f4f4f4;">${
          item.name
        }</td>
        <td style="padding: 12px; text-align: center; border: 1px solid #ddd; background-color: #f4f4f4;">${
          item.quantity
        }</td>
        <td style="padding: 12px; text-align: right; border: 1px solid #ddd; background-color: #f4f4f4;">${item.price.toLocaleString(
          "vi-VN"
        )}đ</td>
      </tr>
    `
    )
    .join("");

  // Xác định nội dung bổ sung cho thanh toán banking
  const bankingInfo =
    orderDetails.paymentMethod === "bank"
      ? `
        <div style="background-color: #e9f7ef; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p style="font-size: 16px; color: #2d3e50;">Nếu bạn chưa thanh toán trên website, vui  lòng chuyển khoản số tiền tổng cộng vào tài khoản dưới đây:</p>
          <p style="font-size: 16px; color: #2d3e50;"><strong>Ngân hàng XYZ</strong></p>
          <p style="font-size: 16px; color: #2d3e50;">Số tài khoản: 1234567890</p>
        </div>
      `
      : "";

  const emailTemplate = `
    <div style="font-family: 'Arial', sans-serif; max-width: 650px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #2d3e50; text-align: center; font-size: 24px; margin-bottom: 20px;">Xác nhận đơn hàng #${
        orderDetails.orderId
      }</h2>
      <p style="font-size: 16px; color: #555;">Xin chào <strong>${
        orderDetails.userInfo.fullName
      }</strong>,</p>
      <p style="font-size: 16px; color: #555;">Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi. Dưới đây là chi tiết đơn hàng của bạn:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #0056b3; color: white;">
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Sản phẩm</th>
            <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Số lượng</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Giá</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
      </table>

      <div style="margin: 20px 0; font-size: 16px;">
        <p><strong>Tổng tiền hàng:</strong> ${orderDetails.subtotal.toLocaleString(
          "vi-VN"
        )}đ</p>
        <p><strong>Phí vận chuyển:</strong> ${orderDetails.shippingFee.toLocaleString(
          "vi-VN"
        )}đ</p>
        <p style="font-size: 18px; font-weight: bold; color: #2d3e50;">
          <strong>Tổng cộng: ${orderDetails.totalAmount.toLocaleString(
            "vi-VN"
          )}đ</strong>
        </p>
      </div>

      <div style="margin: 20px 0;">
        <h3 style="color: #0056b3; font-size: 20px;">Thông tin giao hàng:</h3>
        <p style="font-size: 16px; color: #555;">Người nhận: ${
          orderDetails.userInfo.fullName
        }</p>
        <p style="font-size: 16px; color: #555;">Số điện thoại: ${
          orderDetails.userInfo.phone
        }</p>
        <p style="font-size: 16px; color: #555;">Địa chỉ: ${
          orderDetails.userInfo.address
        }</p>
              <p><strong>Thời gian đặt hàng:</strong> ${
                orderDetails.formattedOrderDate
              }</p>

      </div>

      <div style="margin: 20px 0;">
        <p style="font-size: 16px; color: #555;"><strong>Phương thức thanh toán:</strong> ${
          PAYMENT_METHOD_LABELS[orderDetails.paymentMethod]
        }</p>
        <p style="font-size: 16px; color: #555;"><strong>Trạng thái thanh toán:</strong> ${
          orderDetails.paymentStatus
        }</p>
      </div>

      ${bankingInfo}

      <div style="text-align: center; margin-top: 30px;">
        <a href="http://localhost:3000/OrderHistory" style="padding: 12px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
          Xem lại đơn hàng
        </a>
      </div>

      <p style="font-size: 16px; color: #555; text-align: center; margin-top: 30px;">
        Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất. Cảm ơn bạn đã tin tưởng và mua sắm tại cửa hàng của chúng tôi.
      </p>
      
      <p style="font-size: 16px; color: #555; text-align: center; margin-top: 20px;">Trân trọng,<br>Team hỗ trợ</p>
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
    console.log("Order confirmation email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { sendOrderConfirmationEmail };
