// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Kiểm tra nếu có header Authorization
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(403).json({
      message: "Token is required for access",
    });
  }

  try {
    // Giải mã token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    // Lưu thông tin người dùng vào req.user
    req.user = decoded;

    // Cho phép truy cập tiếp
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token không hợp lệ hoặc đã hết hạn.",
    });
  }
};

module.exports = authMiddleware;
