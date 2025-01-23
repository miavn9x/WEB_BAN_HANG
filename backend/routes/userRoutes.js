// userRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const adminMiddleware = require("../middleware/adminMiddleware");
const authMiddleware = require("../middleware/authMiddleware"); // Thêm dòng này

// API lấy thông tin người dùng
// userRoutes.js
router.get("/users", adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Không trả về password
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error); // Thêm logging
    res.status(500).json({ 
      message: "Lỗi khi lấy danh sách người dùng",
      error: error.message 
    });
  }
});
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    // Tìm người dùng theo ID (được lấy từ token)
    const user = await User.findById(req.user.id).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    ); // Không trả mật khẩu và các token về
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    res.status(200).json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Lỗi server khi lấy thông tin người dùng" });
  }
});

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

// API xóa người dùng (chỉ admin)
router.delete("/users/:id", adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json({
      message: "Xóa người dùng thành công",
      user: deletedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi xóa người dùng",
      error: error.message,
    });
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

    // Kiểm tra mật khẩu cũ và mới có đầy đủ không
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập mật khẩu cũ và mật khẩu mới" });
    }

    // Kiểm tra mật khẩu cũ có đúng không
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu cũ không đúng" });
    }

    // Mã hóa mật khẩu mới và cập nhật vào cơ sở dữ liệu
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    const updatedUser = await user.save();
    res.status(200).json({
      message: "Cập nhật mật khẩu thành công",
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

module.exports = router;
