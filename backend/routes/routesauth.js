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
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đặt lại mật khẩu</title>
      </head>
      <body style="
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
        font-family: Arial, sans-serif;
      ">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: auto; padding: 20px;">
          <tr>
            <td style="padding: 20px 0 5px; text-align: center; background-color: #ffffff; border-radius: 8px 8px 0 0;">
              <img src="https://res.cloudinary.com/div27nz1j/image/upload/v1737451253/1_vmcjnj.png" alt="Logo" width="150" style="max-width: 150px; height: auto;">
                  <h1>  <span style="color: red;" >Baby </span>  <span style="color: blue;">Mart</span></h1>
            </td>
       
          </tr>
          
          <tr>
            <td style="background-color: #ffffff; padding: 10px 30px 40px 30px; border-radius: 0 0 8px 8px;">
              <h1 style="
                color: #333333;
                font-size: 24px;
                margin: 0 0 20px;
                text-align: center;
              ">Yêu cầu đặt lại mật khẩu</h1>
              
              <p style="
                color: #666666;
                font-size: 16px;
                line-height: 1.5;
                margin: 0 0 20px;
              ">Xin chào <i>${user.firstName} ${user.lastName}</i>,</p>
              
              <p style="
                color: #666666;
                font-size: 16px;
                line-height: 1.5;
                margin: 0 0 20px;
              ">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản: ${
                user.email
              } của bạn. Vui lòng click vào nút bên dưới để tiếp tục:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="
                  background-color: #FF6F91;
                  color: #ffffff;
                  text-decoration: none;
                  padding: 12px 30px;
                  border-radius: 4px;
                  font-weight: bold;
                  display: inline-block;
                ">Đặt lại mật khẩu</a>
              </div>
              
              <p style="
                color: #666666;
                font-size: 14px;
                line-height: 1.5;
                margin: 0 0 20px;
              ">Nếu bạn không thể click vào nút trên, vui lòng copy và paste đường link sau vào trình duyệt:</p>
              
              <p style="
                background-color: #f8f8f8;
                padding: 10px;
                border-radius: 4px;
                word-break: break-all;
                margin: 0 0 20px;
                font-size: 14px;
              ">${resetUrl}</p>
              
              <p style="
                color: #666666;
                font-size: 14px;
                line-height: 1.5;
                margin: 0 0 20px;
              ">Link này sẽ hết hạn sau 1 giờ. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
              
              <hr style="
                border: none;
                border-top: 1px solid #eeeeee;
                margin: 30px 0;
              ">
              
              <p style="
                color: #999999;
                font-size: 12px;
                line-height: 1.5;
                margin: 0;
                text-align: center;
              ">Email này được gửi tự động, vui lòng không trả lời. Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua <a href="mailto:miavn9x@gmail.com" style="color: #4CAF50;">support@example.com</a></p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 20px 0; text-align: center;">
              <p style="
                color: #999999;
                font-size: 12px;
                margin: 0;
              ">© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
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
