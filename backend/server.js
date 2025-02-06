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


const notificationRouter = require("./routes/notificationRouter");
app.use("/api", notificationRouter);

// Chạy server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
