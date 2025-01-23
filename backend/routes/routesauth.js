// routesauth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { generateToken } = require("../middleware/auth");

// Đăng ký
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password, role } = req.body;

    console.log("Received registration data:", {
      firstName,
      lastName,
      phone,
      email,
      passwordLength: password?.length,
    });

    // Kiểm tra dữ liệu đầu vào
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

    const newUser = new User({
      firstName,
      lastName,
      phone,
      email,
      password,
      role: role === "admin" ? "admin" : "user",
    });

    const savedUser = await newUser.save();
    console.log("Saved user:", savedUser);

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      user: {
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau" });
  }
});
// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);

    if (!email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(400).json({
        message: "Email hoặc mật khẩu không đúng!",
      });
    }

    console.log("Found user:", {
      id: user._id,
      email: user.email,
      passwordHash: user.password.substring(0, 10) + "...",
    });

    const isMatch = await user.comparePassword(password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return res.status(400).json({
        message: "Email hoặc mật khẩu không đúng!",
      });
    }

    const token = generateToken(user._id);
    console.log("Generated token:", token.substring(0, 20) + "...");

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
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
    pass: process.env.EMAIL_PASS
  },
});

// Các routes
router.post("/register", async (req, res) => {
  // Code đăng ký
});

router.post("/login", async (req, res) => {
  // Code đăng nhập
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
        <p>Xin cảm .</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message:
        "Chúng tôi đã gữi  Email đặt lại mật khẩu cho bạn.  Vui lòng kiểm tra email!",
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
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Đặt lại mật khẩu không thành công  hoặc đã hết hạn"
      });
    }

    // Cập nhật mật khẩu
    user.password = newPassword; // Schema sẽ tự động hash
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Đặt lại mật khẩu thành công"
    });

  } catch (error) {
    console.error("Lỗi reset password:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});
module.exports = router;
