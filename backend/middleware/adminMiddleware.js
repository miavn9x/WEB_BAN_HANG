// middleware/adminMiddleware.js
const jwt = require("jsonwebtoken");

const adminMiddleware = (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(403).json({
      message: "Token is required for access",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    req.user = decoded;
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập vào route này.",
      });
    }
    next(); // Cho phép tiếp tục nếu người dùng là admin
  } catch (error) {
    res.status(401).json({
      message: "Token không hợp lệ hoặc đã hết hạn.",
    });
  }
};

module.exports = adminMiddleware;
