// userRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const adminMiddleware = require("../middleware/adminMiddleware");
const authMiddleware = require("../middleware/authMiddleware"); // Thêm dòng này

// API lấy thông tin người dùng
router.get("/users", adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password"); 
    res.json(users);
  } catch (error) {
    // console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách người dùng",
      error: error.message,
    });
  }
});

// sưa thông tin user của admin
router.put("/users/:id", adminMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, role } = req.body;
    const userId = req.params.id;

    // Validate dữ liệu đầu vào
    if (!firstName || !lastName || !email || !phone || !role) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin" });
    }

    // Tìm và cập nhật user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        email,
        phone,
        role,
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json({
      message: "Cập nhật thành công",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi cập nhật thông tin người dùng",
      error: error.message,
    });
  }
});


// API lấy thông tin người dùng
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        coupons: user.coupons, // Thêm trường coupons
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    res
      .status(500)
      .json({ message: "Lỗi server khi lấy thông tin người dùng" });
  }
});


// API sửa thông tin người dùng
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, phone, email } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!firstName || !lastName || !phone || !email) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin" });
    }

    // Tìm người dùng theo ID
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    // Cập nhật thông tin người dùng
    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone;
    user.email = email;

    const updatedUser = await user.save();
    res.status(200).json({
      message: "Cập nhật thông tin thành công",
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Không thể cập nhật thông tin người dùng" });
  }
});
// API thay đổi mật khẩu
router.put("/profile/password", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập mật khẩu cũ và mật khẩu mới" });
    }
    const isMatch = await user.comparePassword(oldPassword); 
    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu cũ không đúng" });
    }
    user.password = newPassword; 
    const updatedUser = await user.save(); 
    const token = user.generateAuthToken(); 

    res.status(200).json({
      message: "Cập nhật mật khẩu thành công",
      token, 
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Không thể thay đổi mật khẩu" });
  }
});

// API xóa người dùng (chỉ admin mới có quyền)
router.delete("/users/:id", adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.status(200).json({ message: "Xóa tài khoản thành công" });
  } catch (error) {
    console.error("Lỗi xóa người dùng:", error);
    res.status(500).json({
      message: "Lỗi khi xóa tài khoản",
      error: error.message,
    });
  }
});



module.exports = router;
