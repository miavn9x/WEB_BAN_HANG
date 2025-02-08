//authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    // Kiểm tra xem token có được gửi trong header không
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Không có token, quyền truy cập bị từ chối." });
    }

    // Giải mã token và kiểm tra xem token có hợp lệ không
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    // Tìm người dùng dựa trên userId trong decoded token
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Gán thông tin người dùng vào request để sử dụng trong các route sau
    req.user = user;
    next();
  } catch (error) {
    // Kiểm tra nếu token đã hết hạn
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token đã hết hạn." });
    }

    // Nếu lỗi khác, trả về lỗi thông thường
    return res.status(401).json({ message: "Token không hợp lệ hoặc bị lỗi." });
  }
};

module.exports = authMiddleware;
