const express = require("express");
const router = express.Router();
const { getThreats, getThreatById } = require("../controllers/threatController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

router.get("/", getThreats);
router.get("/:id", getThreatById);

module.exports = router;
