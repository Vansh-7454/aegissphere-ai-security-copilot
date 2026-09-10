const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const logRoutes = require("./routes/logRoutes");
const attackTestRoutes = require("./routes/attackTestRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const aiRoutes = require("./routes/aiRoutes");
const reportRoutes = require("./routes/reportRoutes");
const threatRoutes = require("./routes/threatRoutes");
const adminRoutes = require("./routes/adminRoutes");

const {
  apiLimiter,
  authLimiter,
  aiLimiter,
  uploadLimiter,
  attackTestLimiter,
} = require("./middleware/rateLimiters");

dotenv.config();

connectDB();

const app = express();

// Security HTTP Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Prevents interfering with React frontend
  })
);

// CORS Hardening
const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const envAllowed = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((s) => s.trim())
  : [];

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...envAllowed])];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., server-to-server, unit tests, mobile, curl)
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy violation: Origin '${origin}' not allowed.`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Body Parser with strict payload limits (1MB for JSON bodies)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// General Rate Limiting
app.use("/api", apiLimiter);

// API Routes with Target Rate Limiters
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/attack-tests", attackTestLimiter, attackTestRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/ai", aiLimiter, aiRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/threats", threatRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("🚀 AegisSphere Backend Running...");
});

// Global Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size exceeds strict 15MB limit.",
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }

  // Multer custom fileFilter errors
  if (err.message && (err.message.includes("Invalid file format") || err.message.includes("Path traversal"))) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // CORS violation errors
  if (err.message && err.message.includes("CORS policy violation")) {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }

  // JSON syntax errors in request bodies
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Malformed JSON payload in request body.",
    });
  }

  console.error("Internal Server Error:", err.message);

  const isDev = process.env.NODE_ENV === "development";
  res.status(err.status || 500).json({
    success: false,
    message: isDev ? err.message : "An internal server error occurred.",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});