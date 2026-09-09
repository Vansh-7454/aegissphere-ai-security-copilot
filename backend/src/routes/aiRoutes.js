const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { analyzeThreat, getAiStatus } = require("../controllers/aiController");

router.post("/analyze-threat/:threatId", protect, analyzeThreat);
router.get("/status", protect, getAiStatus);

module.exports = router;
