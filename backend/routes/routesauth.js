const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const { generateToken } = require("../middleware/auth");
const adminMiddleware = require("../middleware/adminMiddleware");
// Đăng ký neww
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password, role } = req.body;
    if (!firstName || !lastName || !phone || !email || !password) {
      return res.status(400).json({
        message: "Vui lòng điền đầy đủ thông tin",
      });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({
        message: "Email hoặc số điện thoại đã tồn tại!",
      });
    }

    // Tạo người dùng mới
    const newUser = new User({
      firstName,
      lastName,
      phone,
      email,
      password,
      role: role === "admin" ? "admin" : "user",
    });

    const savedUser = await newUser.save();
    res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      user: savedUser.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau" });
  }
});

// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Email hoặc mật khẩu không đúng!",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Email hoặc mật khẩu không đúng!",
      });
    }

    // Tạo JWT token, bao gồm ID và role của người dùng
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// // Route quên mật khẩu
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại!" });
    }

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1h" }
    );

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Yêu cầu đặt lại mật khẩu",
      html: `
    <!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Đặt lại mật khẩu</title>
  </head>
  <body style="margin: 0; padding: 0;  font-family: Arial, sans-serif;">
    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-collapse: collapse; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden;"
    >
      <!-- Header -->
      <tr>
        <td style="background-color: #FFB6C1; padding: 15px; text-align: center;">
          <img
            src="https://res.cloudinary.com/div27nz1j/image/upload/v1737451253/1_vmcjnj.png"
            alt="Logo"
            width="80"
            style="display: block; margin: auto;"
          />
          <h1 style="margin: 10px 0 5px; font-size: 24px; color: #FF6F91; font-weight: bold;">
            Baby <span style="color: #ffffff;">Chill</span>
          </h1>
          <p style="margin: 0; font-size: 12px; color: #ffffff;">
            CHUỖI HỆ THÔNG SIÊU THỊ MẸ VÀ BÉ
          </p>
        </td>
      </tr>
      <!-- Nội dung chính -->
      <tr>
        <td style="padding: 20px 30px; background-color: #ffffff;">
          <h2 style="font-size: 22px; color: #FF6F91; text-align: center; margin-bottom: 15px;">
            Yêu cầu đặt lại mật khẩu
          </h2>
          <p style="font-size: 15px; color: #333333; margin-bottom: 15px;">
            Xin chào <i>${user.firstName} ${user.lastName}</i>,
          </p>
          <p style="font-size: 15px; color: #333333; margin-bottom: 15px; line-height: 1.4;">
            Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${
              user.email
            }</strong>. Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu của bạn.
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <a
              href="${resetUrl}"
              style="background-color: #ffd5db; color: #FF6F91; text-decoration: none; padding: 10px 25px; border-radius: 4px; font-size: 15px; font-weight: bold; display: inline-block;"
            >
              Đặt lại mật khẩu
            </a>
          </div>
          <p style="font-size: 14px; color: #666666; margin-bottom: 15px;">
            Nếu nút trên không hoạt động, vui lòng sao chép và dán đường link sau vào trình duyệt web của bạn:
          </p>
          <p style="font-size: 14px; color: #666666; background-color: #E6E6FA; padding: 10px; border-radius: 4px; word-break: break-all; margin-bottom: 15px;">
            ${resetUrl}
          </p>
          <p style="font-size: 14px; color: #666666; margin-bottom: 15px;">
            Lưu ý: Link đặt lại mật khẩu này sẽ hết hạn sau 1 giờ. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
          </p>
          <hr style="border: none; border-top: 1px solid #E6E6FA; margin: 20px 0;">
          <p style="font-size: 12px; color: #999999; text-align: center; margin: 0;">
            Email này được gửi tự động, vui lòng không trả lời. Nếu cần hỗ trợ, hãy liên hệ với chúng tôi qua 
            <a href="mailto:miavn9x@gmail.com" style="color: #FF6F91; text-decoration: none;">support@gmail.com</a>.
          </p>
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="background-color: #FFB6C1; padding: 10px; text-align: center;">
          <p style="font-size: 12px; color: #ffffff; margin: 0;">
            © ${new Date().getFullYear()} Babychill.vn. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>

  `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message:
        "Chúng tôi đã gửi Email đặt lại mật khẩu cho bạn. Vui lòng kiểm tra email!",
    });
  } catch (error) {
    console.error("Lỗi forgot password:", error);
    res.status(500).json({
      message: "Có lỗi xảy ra, vui lòng thử lại sau!",
    });
  }
});

// Route reset password
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Đặt lại mật khẩu không thành công hoặc đã hết hạn",
      });
    }

    // Cập nhật mật khẩu
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Đặt lại mật khẩu thành công",
    });
  } catch (error) {
    // console.error("Lỗi reset password:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Route bảo vệ dành cho admin
router.get("/admin-dashboard", adminMiddleware, (req, res) => {
  res.status(200).json({
    message: "Chào mừng bạn đến với bảng điều khiển Admin!",
  });
});

module.exports = router;
