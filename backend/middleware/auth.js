// middleware/auth.js
const jwt = require("jsonwebtoken");

// Create a token with user ID and role
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role }, // Add role to the payload
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "1h" } // Token expiry
  );
};

module.exports = { generateToken };
