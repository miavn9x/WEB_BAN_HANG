// adminMiddleware.js
const jwt = require("jsonwebtoken"); // Thêm dòng này nếu chưa có

const adminMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Không tìm thấy token xác thực",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    console.log("Decoded token:", decoded); // Thêm logging

    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error); // Thêm logging
    return res.status(401).json({
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};

module.exports = adminMiddleware;
