const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Tạo token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
};

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Không có quyền truy cập!" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ!" });
  }
};

const verifyRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          message: "Bạn không có quyền thực hiện thao tác này!",
        });
      }
      next();
    } catch (err) {
      console.error("Lỗi kiểm tra quyền:", err);
      res.status(500).json({ message: "Lỗi máy chủ" });
    }
  };
};

module.exports = { generateToken, authMiddleware, verifyRole };
