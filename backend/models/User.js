const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Vui lòng nhập họ"],
    },
    lastName: {
      type: String,
      required: [true, "Vui lòng nhập tên"],
    },
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
    password: {
      type: String,
      required: [true, "Vui lòng nhập mật khẩu"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // Thêm các trường cho reset password
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

// Middleware tự động hash password trước khi lưu
UserSchema.pre("save", async function (next) {
  // Chỉ hash password khi nó được thay đổi
  if (!this.isModified("password")) return next();

  try {
    // Tạo salt và hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    console.log("Comparing passwords:");
    console.log("Candidate password length:", candidatePassword?.length);
    console.log("Stored hash length:", this.password?.length);

    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log("Password comparison result:", isMatch);

    return isMatch;
  } catch (error) {
    console.error("Password comparison error:", error);
    throw error;
  }
};
// Phương thức so sánh password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Không trả về thông tin nhạy cảm trong JSON
UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  return userObject;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
