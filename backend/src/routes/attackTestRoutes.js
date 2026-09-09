const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
  generateTestAttack,
} = require("../controllers/attackTestController");

router.post("/generate", protect, generateTestAttack);

module.exports = router;