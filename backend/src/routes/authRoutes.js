const express = require("express");
const router = express.Router();
const { register, login, logout, getProfile, getPublicPlatformPreview } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", protect, getProfile);
router.get("/platform-preview", getPublicPlatformPreview);

module.exports = router;