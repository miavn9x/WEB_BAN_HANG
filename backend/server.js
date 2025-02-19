// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/routesauth");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Thêm package mới
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 5001;

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Kết nối MongoDB thành công!"))
  .catch((err) => console.log("Lỗi kết nối MongoDB:", err));

const cron = require("node-cron");

// Lên lịch cron job chạy mỗi ngày lúc nửa đêm

cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();
    console.log(
      `[${new Date().toISOString()}] Bắt đầu dọn dẹp coupon hết hạn...`
    );

    const result = await User.updateMany(
      {}, // Điều kiện (tất cả user)
      {
        $pull: {
          coupons: {
            expiryDate: { $lte: now }, // Điều kiện xóa coupon
          },
        },
      }, // Toán tử update
      { multi: true } // Tùy chọn: áp dụng cho nhiều document
    );

    console.log(`Đã xóa ${result.modifiedCount} coupon hết hạn`);
  } catch (error) {
    console.error("Lỗi cron job:", error);
  }
});

// Middleware
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
  });
}

// Routes
app.use("/api/auth", authRoutes);

const userRoutes = require("./routes/userRoutes"); // Import routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api", userRoutes);

//product routes
const productRoutes = require("./routes/productRoutes");
app.use("/api", productRoutes);
//so luong san pham
const ordersRoute = require("./routes/ordersRoutes");
app.use("/api", ordersRoute);

// product display routes
const productDisplayRoutes = require("./routes/productDisplayRoutes");
app.use("/api/products", productDisplayRoutes);

// cart
const cartRoutes = require("./routes/cartRoutes"); // Import cart.js
// Sử dụng router cho giỏ hàng
app.use("/api", cartRoutes);

const postRoutes = require("./routes/routesposts");
app.use("/api", postRoutes);

const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

// Thêm Timer Routes (đường dẫn sẽ là /api/timer)
const timerRoutes = require("./routes/timerRoutes");
app.use("/api", timerRoutes);

// Import và sử dụng route AI
const aiRoutes = require("./routes/aiRoutes");
app.use("/api", aiRoutes);

// lich su xem
const viewHistoryRoutes = require("./routes/viewHistory");
app.use("/api/view-history", viewHistoryRoutes);

// lich su tim kiem
const searchRoutes = require("./routes/searchRoutes");
app.use("/api", searchRoutes);
// Import routes
const recommendationRoutes = require("./routes/recommendations");
app.use("/api/recommendations", recommendationRoutes);

//đề xuat
const inventoryRoutes = require("./routes/inventoryRoutes");
app.use("/api", inventoryRoutes);

//giam giá
const couponRoutes = require("./routes/couponRoutes");
app.use("/api/coupons", couponRoutes);

const chatRoutes = require("./routes/chatRoutes");
app.use("/api/chats", chatRoutes);

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
