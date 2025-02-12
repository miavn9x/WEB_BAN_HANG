//middleware/adminMiddleware
const jwt = require("jsonwebtoken");

// Lấy secret từ file .env
const { JWT_SECRET } = process.env;

// Kiểm tra nếu JWT_SECRET không tồn tại
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET không được cấu hình trong môi trường.");
}

// Middleware kiểm tra token
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Không tìm thấy token. Vui lòng đăng nhập." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    // console.error("Lỗi xác thực token:", err);
    res.status(401).json({
      message: "Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
    });
  }
};

module.exports = authMiddleware;
