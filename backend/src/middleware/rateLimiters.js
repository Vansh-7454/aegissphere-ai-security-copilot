const rateLimit = require("express-rate-limit");

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests to the API. Please slow down.",
  },
  skip: () => process.env.NODE_ENV === "test",
});

// Authentication rate limiter (Brute-force protection for login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.AUTH_RATE_LIMIT_MAX ? parseInt(process.env.AUTH_RATE_LIMIT_MAX) : 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts from this IP. Please try again after 15 minutes.",
  },
  skip: () => process.env.NODE_ENV === "test",
});

// AI analysis rate limiter (Protects free-tier quota)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.AI_RATE_LIMIT_MAX ? parseInt(process.env.AI_RATE_LIMIT_MAX) : 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "AI analysis rate limit exceeded. Please wait before analyzing additional threats.",
  },
  skip: () => process.env.NODE_ENV === "test",
});

// Upload rate limiter (Protects disk storage and upload bandwidth)
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.UPLOAD_RATE_LIMIT_MAX ? parseInt(process.env.UPLOAD_RATE_LIMIT_MAX) : 80,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Log file upload rate limit exceeded. Please wait before uploading more files.",
  },
  skip: () => process.env.NODE_ENV === "test",
});

// Security Test Lab rate limiter
const attackTestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.ATTACK_RATE_LIMIT_MAX ? parseInt(process.env.ATTACK_RATE_LIMIT_MAX) : 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Security test lab generation rate limit exceeded. Please try again later.",
  },
  skip: () => process.env.NODE_ENV === "test",
});

module.exports = {
  apiLimiter,
  authLimiter,
  aiLimiter,
  uploadLimiter,
  attackTestLimiter,
};
