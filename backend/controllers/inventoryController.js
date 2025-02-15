const InventoryTransaction = require("../models/inventoryTransactionModel");

exports.getInventoryStats = async (req, res) => {
  try {
    const { period } = req.query;
    let startDate = new Date();

    if (period === "day") {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "week") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Thời gian không hợp lệ!" });
    }

    console.log("🔎 Thời gian lọc:", startDate);

    const sales = await InventoryTransaction.aggregate([
      { $match: { date: { $gte: startDate }, type: "sale" } },
      { $group: { _id: "$productId", totalSold: { $sum: "$quantity" } } },
      { $sort: { totalSold: -1 } },
    ]);

    console.log("📊 Dữ liệu sales trả về:", sales);

    res.status(200).json({ success: true, sales });
  } catch (error) {
    console.error("❌ Lỗi API getInventoryStats:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
