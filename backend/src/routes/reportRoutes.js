const express = require("express");
const router = express.Router();
const {
  getReports,
  getReportById,
  getReportPdf,
  deleteReport,
} = require("../controllers/reportController");
const protect = require("../middleware/authMiddleware");

// All report routes require JWT authentication
router.use(protect);

router.get("/", getReports);
router.get("/:id", getReportById);
router.get("/:id/pdf", getReportPdf);
router.delete("/:id", deleteReport);

module.exports = router;
