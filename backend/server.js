// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Các package, model và route
const authRoutes = require("./routes/routesauth");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Package mới

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Kết nối MongoDB thành công!"))
  .catch((err) => console.log("Lỗi kết nối MongoDB:", err));

const cron = require("node-cron");
// Lên lịch cron job chạy mỗi ngày lúc nửa đêm để dọn dẹp coupon hết hạn
cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();
    console.log(`[${now.toISOString()}] Bắt đầu dọn dẹp coupon hết hạn...`);

    const result = await User.updateMany(
      {}, // Áp dụng cho tất cả user
      {
        $pull: {
          coupons: {
            expiryDate: { $lte: now }, // Xóa các coupon có ngày hết hạn nhỏ hơn hoặc bằng hiện tại
          },
        },
      },
      { multi: true }
    );

    console.log(`Đã xóa ${result.modifiedCount} coupon hết hạn`);
  } catch (error) {
    console.error("Lỗi cron job:", error);
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Các route API
app.use("/api/auth", authRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);
app.use("/api", userRoutes);

const productRoutes = require("./routes/productRoutes");
app.use("/api", productRoutes);

const ordersRoute = require("./routes/ordersRoutes");
app.use("/api", ordersRoute);

const productDisplayRoutes = require("./routes/productDisplayRoutes");
app.use("/api/products", productDisplayRoutes);

const cartRoutes = require("./routes/cartRoutes");
app.use("/api", cartRoutes);

const postRoutes = require("./routes/routesposts");
app.use("/api", postRoutes);

const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

const timerRoutes = require("./routes/timerRoutes");
app.use("/api", timerRoutes);

const aiRoutes = require("./routes/aiRoutes");
app.use("/api", aiRoutes);

const viewHistoryRoutes = require("./routes/viewHistory");
app.use("/api/view-history", viewHistoryRoutes);

const searchRoutes = require("./routes/searchRoutes");
app.use("/api", searchRoutes);

const recommendationRoutes = require("./routes/recommendations");
app.use("/api/recommendations", recommendationRoutes);

const inventoryRoutes = require("./routes/inventoryRoutes");
app.use("/api", inventoryRoutes);

const couponRoutes = require("./routes/couponRoutes");
app.use("/api/coupons", couponRoutes);

const chatRoutes = require("./routes/chatRoutes");
app.use("/api/chats", chatRoutes);

// Serve static files nếu đang ở môi trường production
if (process.env.NODE_ENV === "production") {
  // Đường dẫn tới thư mục build của React (frontend)
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  // Các request không khớp API sẽ trả về file index.html của React
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
