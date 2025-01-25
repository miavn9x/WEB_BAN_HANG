const jwt = require("jsonwebtoken");
const User = require("../models/User"); 

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Không có token, quyền truy cập bị từ chối." });
    }

    // Giải mã token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    const user = await User.findById(decoded.userId); 
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    req.user = user;

    next();
  } catch (error) {
    // console.error("Lỗi xác thực:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token đã hết hạn." });
    }

    return res.status(401).json({ message: "Token không hợp lệ hoặc bị lỗi." });
  }
};

module.exports = authMiddleware;
