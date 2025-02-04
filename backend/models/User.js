// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // Import jwt để tạo token

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, "Vui lòng nhập họ"] },
    lastName: { type: String, required: [true, "Vui lòng nhập tên"] },
    phone: {
      type: String,
      required: [true, "Vui lòng nhập số điện thoại"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Vui lòng nhập email"],
      unique: true,
      lowercase: true,
    },
    password: { type: String, required: [true, "Vui lòng nhập mật khẩu"] },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); 
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt); 
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

UserSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { userId: this._id, role: this.role }, 
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "1h" } 
  );
};

UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  return userObject;
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
