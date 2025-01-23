const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // Chỉ cần khai báo một lần ở đầu file
const User = require("../models/User");
const nodemailer = require("nodemailer");
const { generateToken } = require("../middleware/auth");
const adminMiddleware = require("../middleware/adminMiddleware"); // Import adminMiddleware

// Đăng ký
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password, role } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!firstName || !lastName || !phone || !email || !password) {
      return res.status(400).json({
        message: "Vui lòng điền đầy đủ thông tin",
      });
    }

    // Kiểm tra email hoặc số điện thoại đã tồn tại chưa
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
      role: role === "admin" ? "admin" : "user", // Phân quyền 'admin' hoặc 'user'
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

// Cấu hình nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Route quên mật khẩu
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
        <h1>Yêu cầu đặt lại mật khẩu</h1>
        <p>Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu.</p>
        <p>Vui lòng click vào link dưới đây để đặt lại mật khẩu:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Link này sẽ hết hạn sau 1 giờ.</p>
        <p>Nếu bạn không yêu cầu việc này, vui lòng bỏ qua email này.</p>
        <p>Xin cảm ơn.</p>
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
    user.password = newPassword; // Schema sẽ tự động hash
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Đặt lại mật khẩu thành công",
    });
  } catch (error) {
    console.error("Lỗi reset password:", error);
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
