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
    .map((item, index) => {
      const rowBg = index % 2 === 0 ? "#FFF4E6" : "#ffffff";
      return `
        <tr style="background-color: ${rowBg};">
          <td style="padding: 12px; text-align: left; border: 1px solid #E6E6FA;">${
            item.name
          }</td>
          <td style="padding: 12px; text-align: center; border: 1px solid #E6E6FA;">${
            item.quantity
          }</td>
          <td style="padding: 12px; text-align: right; border: 1px solid #E6E6FA;">${item.price.toLocaleString(
            "vi-VN"
          )}đ</td>
        </tr>
      `;
    })
    .join("");

  // Thông tin chuyển khoản nếu phương thức là ngân hàng
  const bankingInfo =
    orderDetails.paymentMethod === "bank"
      ? `
        <div style="background-color: #E6E6FA; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p style="font-size: 16px; color: #ffffff; margin: 0;"><strong>Vui lòng chuyển khoản đến:</strong></p>
          <p style="margin: 5px 0 0; color: #ffffff;"><strong>Ngân hàng XYZ</strong> - Số tài khoản: 1234567890</p>
        </div>
      `
      : "";

  const emailTemplate = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Đặt lại mật khẩu</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 30px auto; background-color: #FFF4E6; border-collapse: collapse; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
      <!-- Header -->
      <tr>
        <td style="background-color: #8B4513; padding: 15px; text-align: center;">
          <img src="https://res.cloudinary.com/dhbyhp8nw/image/upload/v1742030869/logo_ch4fq2.png" alt="Logo" width="80" style="display: block; margin: auto;" />
          <h1 style="margin: 10px 0 5px; font-size: 24px; color: #ffffff; font-weight: bold;">
            Go <span style="color: #ffffff;">Book</span>
          </h1>
          <p style="margin: 0; font-size: 12px; color: #ffffff;">
            CHUỖI HỆ THỐNG CỬA HÀNG SÁCH
          </p>
        </td>
      </tr>
      <!-- Nội dung chính -->
      <tr>
        <td style="padding: 20px 30px; background-color: #ffffff;">
          <h2 style="font-size: 22px; color: #8B4513; text-align: center; margin-bottom: 15px;">
            Xác nhận đơn hàng
          </h2>
          <p style="font-size: 16px; color: #333333; margin-bottom: 15px;">
            Xin chào <strong>${orderDetails.userInfo.fullName}</strong>,
          </p>
          <p style="font-size: 15px; color: #555555; margin-bottom: 15px; line-height: 1.4;">
            Cảm ơn bạn đã đặt hàng. Dưới đây là chi tiết đơn hàng của bạn:
          </p>
          <!-- Thông tin giao hàng -->
          <div style="margin-top: 20px;">
            <h2 style="font-size: 20px; color: #8B4513; border-bottom: 1px solid #E6E6FA; padding-bottom: 5px;">Thông tin giao hàng</h2>
            <p style="margin: 8px 0;"><strong>Người nhận:</strong> ${
              orderDetails.userInfo.fullName
            }</p>
            <p style="margin: 8px 0;"><strong>Số điện thoại:</strong> ${
              orderDetails.userInfo.phone
            }</p>
            <p style="margin: 8px 0;"><strong>Địa chỉ:</strong> ${
              orderDetails.userInfo.address
            }</p>
            <p style="margin: 8px 0;"><strong>Thời gian đặt hàng:</strong> ${
              orderDetails.formattedOrderDate
            }</p>
          </div>
          <!-- Thông tin thanh toán -->
          <div style="margin-top: 20px;">
            <h2 style="font-size: 20px; color: #8B4513; border-bottom: 1px solid #E6E6FA; padding-bottom: 5px;">Thông tin thanh toán</h2>
            <p style="margin: 8px 0;"><strong>Phương thức thanh toán:</strong> ${paymentLabel}</p>
            <p style="margin: 8px 0;"><strong>Trạng thái thanh toán:</strong> ${paymentStatusLabel}</p>
          </div>
          <!-- Danh sách sản phẩm -->
          <div style="margin-top: 20px;">
            <h2 style="font-size: 20px; color: #8B4513; border-bottom: 1px solid #E6E6FA; padding-bottom: 5px;">Thông tin sản phẩm</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background-color: #ffd5db;">
                  <th style="padding: 12px; border: 1px solid #E6E6FA;">Sản phẩm</th>
                  <th style="padding: 12px; border: 1px solid #E6E6FA;">Số lượng</th>
                  <th style="padding: 12px; border: 1px solid #E6E6FA;">Giá</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>
          </div>
          <!-- Tổng tiền thanh toán -->
          <div style="margin-top: 20px; text-align: right; font-size: 16px;">
            <p style="margin: 5px 0;"><strong>Tổng tiền hàng:</strong> ${orderDetails.subtotal.toLocaleString(
              "vi-VN"
            )}đ</p>
            <p style="margin: 5px 0;"><strong>Phí vận chuyển:</strong> ${orderDetails.shippingFee.toLocaleString(
              "vi-VN"
            )}đ</p>
            <p style="margin: 5px 0; font-size: 18px; color: #FF6F91;"><strong>Tổng cộng:</strong> ${orderDetails.totalAmount.toLocaleString(
              "vi-VN"
            )}đ</p>
          </div>
          <!-- Thông tin chuyển khoản nếu cần -->
          ${bankingInfo}
          <!-- Nút CTA -->
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000/order-history/:orderId" style="background-color: #ffd5db; color: #FF6F91; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
              Xem lại đơn hàng
            </a>
          </div>
          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; font-size: 14px; color: #999999; border-top: 1px solid #E6E6FA; padding-top: 10px;">
            <p>
              Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ: 
              <a href="mailto:supportgobook@gmail.com" style="color: #8B4513; text-decoration: none;">
                supportgobook@gmail.com
              </a>
            </p>
            <p>Cảm ơn bạn đã mua hàng!</p>
          </div>
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="background-color: #8B4513; padding: 10px; text-align: center;">
          <p style="font-size: 12px; color: #ffffff; margin: 0;">
            © ${new Date().getFullYear()} Go Book. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `Xác nhận đơn hàng #${orderDetails.orderId}`,
    html: emailTemplate,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
};

module.exports = { sendOrderConfirmationEmail };
