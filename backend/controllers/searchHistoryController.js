// // controllers/searchHistoryController.js
// const SearchHistory = require("../models/SearchHistory");
// exports.createSearchHistory = async (req, res) => {
//   try {
//     const { query } = req.body;
//     if (!query) {
//       return res.status(400).json({ message: "Từ khóa tìm kiếm là bắt buộc" });
//     }

//     const userId = req.user._id;

//     // Sử dụng new để tạo document và save để bắt lỗi chi tiết
//     const newSearchHistory = new SearchHistory({
//       user: userId,
//       query,
//     });

//     await newSearchHistory.save();

//     return res.status(201).json({
//       message: "Lịch sử tìm kiếm đã được lưu thành công",
//       searchHistory: newSearchHistory,
//     });
//   } catch (error) {
//     console.error("Lỗi khi lưu lịch sử tìm kiếm:", error);
//     // Trả về lỗi validation chi tiết từ Mongoose
//     if (error.name === "ValidationError") {
//       return res.status(400).json({ message: error.message });
//     }
//     return res.status(500).json({ message: "Lỗi server" });
//   }
// };
// exports.getSearchHistory = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     // Sắp xếp theo createdAt nếu searchedAt không có dữ liệu chính xác
//     const history = await SearchHistory.find({ user: userId }).sort({
//       createdAt: -1,
//     });
//     return res.status(200).json({ history });
//   } catch (error) {
//     console.error("Lỗi khi lấy lịch sử tìm kiếm:", error);
//     return res.status(500).json({ message: "Lỗi server" });
//   }
// };
