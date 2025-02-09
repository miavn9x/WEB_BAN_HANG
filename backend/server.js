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
const PORT = process.env.PORT || 5001;

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Kết nối MongoDB thành công!"))
  .catch((err) => console.log("Lỗi kết nối MongoDB:", err));

// Middleware
app.use(cors());
app.use(express.json());


router.get('/timer', (req, res) => {
  const now = Date.now();
  
  if (!global.timerState) {
    global.timerState = {
      phase: 'main',
      targetTime: now + 2 * 60 * 60 * 1000 // 2 giờ
    };
  }

  if (now >= global.timerState.targetTime) {
    const nextPhase = global.timerState.phase === 'main' ? 'reset' : 'main';
    const duration = nextPhase === 'main' ? 2 * 60 * 60 * 1000 : 10 * 60 * 1000;
    
    global.timerState = {
      phase: nextPhase,
      targetTime: now + duration
    };
  }

  res.json({
    currentPhase: global.timerState.phase,
    targetTime: global.timerState.targetTime,
    serverTime: now
  });
});



// Routes
app.use("/api/auth", authRoutes);


const userRoutes = require("./routes/userRoutes"); // Import routes

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



const reviewRouter = require("./routes/reviewRouter");
app.use("/api", reviewRouter);


const questionRouter = require("./routes/questionRouter");
app.use("/api", questionRouter);


const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

// Chạy server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
