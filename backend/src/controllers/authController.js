const User = require("../models/User");
const AdminAuditLog = require("../models/AdminAuditLog");
const Log = require("../models/Log");
const Threat = require("../models/Threat");
const Incident = require("../models/Incident");
const Report = require("../models/Report");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Password strength validator
const isStrongPassword = (password) => {
  return typeof password === "string" && password.length >= 6;
};

// Register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, email, password) are required.",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Public registration strictly creates Analyst role with active status
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "Analyst",
      status: "active",
    });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET || "YourSecretKey123",
      {
        expiresIn: "7d",
      }
    );

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error during registration.",
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials. User not found.",
      });
    }

    // Check account status
    if (user.status && user.status.toLowerCase() === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Account Suspended: Your access has been deactivated by a platform administrator.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials. Password incorrect.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET || "YourSecretKey123",
      {
        expiresIn: "7d",
      }
    );

    // Record ADMIN_LOGIN audit event if user has admin role
    if (user.role && user.role.toLowerCase() === "admin") {
      try {
        await AdminAuditLog.create({
          actor: user._id,
          actorEmail: user.email,
          actorRole: user.role,
          action: "ADMIN_LOGIN",
          targetType: "System",
          targetId: user._id.toString(),
          ipAddress: req.ip || req.connection?.remoteAddress || "127.0.0.1",
          result: "SUCCESS",
          metadata: { userAgent: req.headers["user-agent"] || "unknown" },
        });
      } catch (auditErr) {
        console.warn("Failed to record ADMIN_LOGIN audit entry:", auditErr.message);
      }
    }

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || "active",
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error during login.",
    });
  }
};

// Logout
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// Get User Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GetProfile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error fetching profile",
    });
  }
};

// Public Platform Real-Time Preview Metrics for Landing Page
const getPublicPlatformPreview = async (req, res) => {
  try {
    const [
      totalLogs,
      totalThreats,
      criticalThreats,
      highThreats,
      mediumThreats,
      lowThreats,
      totalIncidents,
      openIncidents,
      totalReports,
      recentThreatsDocs,
    ] = await Promise.all([
      Log.countDocuments(),
      Threat.countDocuments(),
      Threat.countDocuments({ severity: "Critical" }),
      Threat.countDocuments({ severity: "High" }),
      Threat.countDocuments({ severity: "Medium" }),
      Threat.countDocuments({ severity: "Low" }),
      Incident.countDocuments(),
      Incident.countDocuments({ status: { $nin: ["Closed", "Mitigated", "Resolved"] } }),
      Report.countDocuments(),
      Threat.find().sort({ createdAt: -1 }).limit(5),
    ]);

    // Real 7-day trend from MongoDB
    const now = new Date();
    const trendMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`;
      trendMap[dateKey] = { time: dateKey, threats: 0 };
    }
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const threatsLast7 = await Threat.find({ createdAt: { $gte: sevenDaysAgo } });
    threatsLast7.forEach((t) => {
      const d = new Date(t.createdAt);
      const dateKey = `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`;
      if (trendMap[dateKey]) {
        trendMap[dateKey].threats += 1;
      }
    });
    const trendData = Object.values(trendMap);

    res.status(200).json({
      success: true,
      stats: {
        totalLogs,
        totalThreats,
        criticalThreats,
        highThreats,
        mediumThreats,
        lowThreats,
        totalIncidents,
        openIncidents,
        totalReports,
      },
      severityBreakdown: [
        { name: "Critical", value: criticalThreats, color: "#EF4444" },
        { name: "High", value: highThreats, color: "#F59E0B" },
        { name: "Medium", value: mediumThreats, color: "#06B6D4" },
        { name: "Low", value: lowThreats, color: "#22C55E" },
      ],
      recentThreats: recentThreatsDocs.map((t) => ({
        id: t._id,
        name: t.threatType || "Unclassified Threat",
        sev: (t.severity || "Medium").toLowerCase(),
        severity: t.severity || "Medium",
        ip: t.sourceIp || "Ingress Node",
        time: t.mitreTechnique ? `Rule ${t.mitreTechnique}` : new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: t.status || "DETECTED",
        confidence: t.confidenceScore || 92.5,
      })),
      trendData,
    });
  } catch (error) {
    console.error("Public Platform Preview Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching platform preview metrics.",
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  getPublicPlatformPreview,
};