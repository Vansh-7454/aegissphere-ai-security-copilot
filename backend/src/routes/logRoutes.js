const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const protect = require("../middleware/authMiddleware");
const { uploadLog, getLogs, getLogById, deleteLog } = require("../controllers/logController");

router.post("/upload", protect, upload.single("logFile"), uploadLog);
router.get("/", protect, getLogs);
router.get("/:id", protect, getLogById);
router.delete("/:id", protect, deleteLog);

module.exports = router;