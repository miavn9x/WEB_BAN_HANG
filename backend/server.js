// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const cron = require("node-cron");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI) // Không cần useNewUrlParser & useUnifiedTopology nữa
  .then(() => console.log("Kết nối MongoDB thành công!"))
  .catch((err) => console.log("Lỗi kết nối MongoDB:", err));

// Đoạn cron job dọn dẹp coupon
const User = require("./models/User");
cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();
    console.log(`[${now.toISOString()}] Bắt đầu dọn dẹp coupon hết hạn...`);

    const result = await User.updateMany(
      {},
      {
        $pull: {
          coupons: {
            expiryDate: { $lte: now },
          },
        },
      }
    );

    console.log(`Đã xóa ${result.modifiedCount} coupon hết hạn`);
  } catch (error) {
    console.error("Lỗi cron job:", error);
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require("./routes/routesauth");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const ordersRoute = require("./routes/ordersRoutes");
const productDisplayRoutes = require("./routes/productDisplayRoutes");
const cartRoutes = require("./routes/cartRoutes");
const postRoutes = require("./routes/routesposts");
const notificationRoutes = require("./routes/notificationRoutes");
const timerRoutes = require("./routes/timerRoutes");
const aiRoutes = require("./routes/aiRoutes");
const viewHistoryRoutes = require("./routes/viewHistory");
const searchRoutes = require("./routes/searchRoutes");
const recommendationRoutes = require("./routes/recommendations");
const inventoryRoutes = require("./routes/inventoryRoutes");
const couponRoutes = require("./routes/couponRoutes");
const chatRoutes = require("./routes/chatRoutes");

// Sử dụng routes
app.use("/api/auth", authRoutes);

// Nếu bạn cần đường dẫn /api/users
app.use("/api/users", userRoutes);

// Dòng này có thể bị trùng với dòng trên (tùy logic dự án):
app.use("/api", userRoutes);

app.use("/api", productRoutes);
app.use("/api", ordersRoute);
app.use("/api/products", productDisplayRoutes);
app.use("/api", cartRoutes);
app.use("/api", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", timerRoutes);
app.use("/api", aiRoutes);
app.use("/api/view-history", viewHistoryRoutes);
app.use("/api", searchRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api", inventoryRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/chats", chatRoutes);

// Serve static files nếu đang ở môi trường production
if (process.env.NODE_ENV === "production") {
  // Phục vụ file tĩnh từ thư mục build của React
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  // Trả về index.html cho mọi route không khớp API
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
