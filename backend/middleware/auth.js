// middleware/auth.js
const jwt = require("jsonwebtoken");

// Tạo token với userId và role
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "10h" }
  );
};

module.exports = { generateToken };

