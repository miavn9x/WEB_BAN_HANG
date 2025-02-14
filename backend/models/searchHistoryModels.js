const SearchHistory = require("./SearchHistory");
const mongoose = require("mongoose");

const MAX_HISTORY = 50;

/**
 * Thêm một truy vấn tìm kiếm cho người dùng.
 * @param {string} userId - ID của người dùng
 * @param {string} query - Nội dung truy vấn tìm kiếm
 */
async function addSearch(userId, query) {
  try {
    // Sử dụng findOneAndUpdate với upsert để cập nhật hoặc tạo mới document
    const result = await SearchHistory.findOneAndUpdate(
      { user: userId },
      {
        $push: {
          searches: {
            $each: [{ query, searchedAt: new Date() }],
            $sort: { searchedAt: -1 },
            $slice: MAX_HISTORY,
          },
        },
      },
      {
        new: true,
        upsert: true,
      }
    );
    return result;
  } catch (error) {
    console.error("Lỗi khi lưu lịch sử tìm kiếm:", error);
    throw error;
  }
}

/**
 * Lấy lịch sử tìm kiếm của người dùng.
 * @param {string} userId - ID của người dùng
 * @returns {Object} Document chứa lịch sử tìm kiếm
 */
async function getSearchHistory(userId) {
  try {
    return await SearchHistory.findOne({ user: userId }).sort({
      "searches.searchedAt": -1,
    });
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử tìm kiếm:", error);
    return null;
  }
}

module.exports = {
  addSearch,
  getSearchHistory,
};
