const express = require("express");
const router = express.Router();
const { analyzeReview } = require("../controllers/aiController");

router.post("/analyze-review", analyzeReview);

module.exports = router;
