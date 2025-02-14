// exportData.js
require("dotenv").config(); // Nạp biến môi trường từ file .env

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Product = require("./models/productModel"); // Đảm bảo đường dẫn đúng

// In ra biến MONGO_URI để kiểm tra
console.log("MONGO_URI:", process.env.MONGO_URI);

// Kết nối tới MongoDB sử dụng biến môi trường MONGO_URI
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("error", (err) => {
  console.error("Kết nối MongoDB lỗi:", err);
});

mongoose.connection.once("open", async () => {
  console.log("Kết nối MongoDB thành công.");

  try {
    // Truy vấn tất cả sản phẩm, chỉ lấy các trường cần thiết
    const products = await Product.find(
      {},
      {
        name: 1,
        "category.name": 1,
        "category.generic": 1,
        priceAfterDiscount: 1,
        remainingStock: 1,
      }
    ).lean();

    // Chuyển đổi dữ liệu thành chuỗi theo cấu trúc yêu cầu:
    // Mỗi dòng: |id sản phẩm|danh mục|loại danh mục|tên sản phẩm|giá sau giảm|số lượng còn lại|
    const lines = products.map((product) => {
      const id = product._id;
      const danhMuc =
        product.category && product.category.name ? product.category.name : "";
      const loaiDanhMuc =
        product.category && product.category.generic
          ? product.category.generic
          : "";
      const tenSanPham = product.name || "";
      const giaSauGiam =
        product.priceAfterDiscount != null ? product.priceAfterDiscount : "";
      const soLuongConLai =
        product.remainingStock != null ? product.remainingStock : "";

      return `|${id}|${danhMuc}|${loaiDanhMuc}|${tenSanPham}|${giaSauGiam}|${soLuongConLai}|`;
    });

    const fileContent = lines.join("\n");

    // Đường dẫn lưu file, ví dụ: data/data.txt (đảm bảo thư mục data đã tồn tại)
    const filePath = path.join(__dirname, "data", "data.txt");

    // Ghi dữ liệu vào file
    fs.writeFileSync(filePath, fileContent, "utf8");
    console.log("Dữ liệu sản phẩm đã được lưu vào:", filePath);
  } catch (error) {
    console.error("Lỗi khi truy xuất hoặc lưu dữ liệu:", error);
  } finally {
    // Đóng kết nối MongoDB
    mongoose.connection.close();
  }
});
