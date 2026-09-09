const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
  getDashboard,
  getStats,
  getRecentThreats,
  getReports,
} = require("../controllers/dashboardController");

router.get("/", protect, getDashboard);
router.get("/stats", protect, getStats);
router.get("/recent-threats", protect, getRecentThreats);
router.get("/reports", protect, getReports);

module.exports = router;