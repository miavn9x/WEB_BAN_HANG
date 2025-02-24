const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Chưa xác thực người dùng." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền truy cập tài nguyên này." });
    }
    next();
  };
};

module.exports = roleMiddleware;
