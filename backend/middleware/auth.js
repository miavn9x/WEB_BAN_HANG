// middleware/auth.js
const jwt = require("jsonwebtoken");

// Create a token with user ID and role
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role }, 
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "1h" } 
  );
};

module.exports = { generateToken };
