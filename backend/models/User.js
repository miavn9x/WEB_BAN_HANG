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
      enum: ["user", "admin"], // Chỉ cho phép 'user' hoặc 'admin'
      default: "user", // Mặc định là 'user'
    },
    // Các trường hỗ trợ chức năng đặt lại mật khẩu
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

// Middleware để tự động mã hóa mật khẩu trước khi lưu vào DB
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10); // Tạo salt
    this.password = await bcrypt.hash(this.password, salt); // Mã hóa mật khẩu
    next();
  } catch (error) {
    next(error);
  }
});

// Phương thức so sánh mật khẩu khi đăng nhập
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Không trả về các thông tin nhạy cảm trong JSON response
UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password; // Xóa mật khẩu
  delete userObject.resetPasswordToken; // Xóa token reset password
  delete userObject.resetPasswordExpires; // Xóa token hết hạn
  return userObject;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
