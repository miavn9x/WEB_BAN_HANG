const express = require("express");
const router = express.Router();
const { getInventoryStats } = require("../controllers/inventoryController");

router.get("/inventory/stats", getInventoryStats);

module.exports = router;
