const Threat = require("../models/Threat");
const Log = require("../models/Log");
const Report = require("../models/Report");
const Incident = require("../models/Incident");

// Helper to get strictly personal data for the authenticated user
const getScopedData = async (user) => {
  const userId = user.id || (user._id ? user._id.toString() : user);

  // 1. User's uploaded logs
  const logs = await Log.find({ uploadedBy: userId })
    .populate("uploadedBy", "name email role")
    .populate("analysis")
    .sort({ createdAt: -1 });

  const logIds = logs.map((l) => l._id);

  // 2. Fetch threats, reports, and incidents strictly tied to this user
  const [threats, reports, incidents] = await Promise.all([
    Threat.find({ logId: { $in: logIds } })
      .populate("logId")
      .sort({ createdAt: -1 }),

    Report.find({
      $or: [{ generatedBy: userId }, { logId: { $in: logIds } }],
    })
      .populate("generatedBy", "name email role")
      .populate("logId")
      .sort({ createdAt: -1 }),

    Incident.find({
      $or: [{ assignedTo: userId }, { logId: { $in: logIds } }],
    })
      .populate("assignedTo", "name email role")
      .populate("threatId")
      .populate("logId")
      .sort({ createdAt: -1 }),
  ]);

  return { logs, threats, reports, incidents };
};

// GET /api/dashboard
const getDashboard = async (req, res) => {
  try {
    const { logs, threats, reports, incidents } = await getScopedData(req.user);

    const totalLogs = logs.length;
    const totalThreats = threats.length;
    const criticalThreats = threats.filter((t) => t.severity === "Critical").length;
    const highThreats = threats.filter((t) => t.severity === "High").length;
    const mediumThreats = threats.filter((t) => t.severity === "Medium").length;
    const lowThreats = threats.filter((t) => t.severity === "Low").length;
    const openIncidents = incidents.filter((i) => i.status !== "Closed" && i.status !== "Mitigated").length;

    // Calculate 7-day trend from personal real data
    const now = new Date();
    const trendMap = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`;
      trendMap[dateKey] = { time: dateKey, threats: 0, critical: 0, high: 0, medium: 0, low: 0 };
    }

    threats.forEach((t) => {
      const d = new Date(t.createdAt);
      const dateKey = `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`;
      if (trendMap[dateKey]) {
        trendMap[dateKey].threats += 1;
        const sev = (t.severity || "Low").toLowerCase();
        if (trendMap[dateKey][sev] !== undefined) {
          trendMap[dateKey][sev] += 1;
        }
      }
    });

    const threatTrend = Object.values(trendMap);

    // Derive recent personal activity feed
    const activityItems = [];
    logs.slice(0, 5).forEach((l) => {
      activityItems.push({
        id: `log-${l._id}`,
        type: "log_upload",
        title: `Log file uploaded (${l.originalName})`,
        time: l.createdAt,
        severity: "low",
      });
    });

    threats.slice(0, 5).forEach((t) => {
      activityItems.push({
        id: `threat-${t._id}`,
        type: "threat_detected",
        title: `${t.threatType} detected from ${t.sourceIp || "telemetry"}`,
        time: t.createdAt,
        severity: (t.severity || "medium").toLowerCase(),
      });
    });

    activityItems.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.status(200).json({
      success: true,
      stats: {
        totalLogs,
        totalThreats,
        criticalThreats,
        highThreats,
        mediumThreats,
        lowThreats,
        openIncidents,
        reportsCount: reports.length,
        activeAgents: 4,
      },
      totalLogs,
      totalThreats,
      criticalThreats,
      highThreats,
      openIncidents,
      threats: threats.slice(0, 10),
      recentThreats: threats.slice(0, 6),
      recentActivity: activityItems.slice(0, 5),
      threatTrend,
      reports: reports.slice(0, 5),
    });
  } catch (error) {
    console.error("Get Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error fetching dashboard metrics.",
    });
  }
};

// GET /api/dashboard/stats
const getStats = async (req, res) => {
  return getDashboard(req, res);
};

// GET /api/dashboard/recent-threats
const getRecentThreats = async (req, res) => {
  try {
    const { threats } = await getScopedData(req.user);
    res.status(200).json({
      success: true,
      count: threats.length,
      threats: threats.slice(0, 10),
    });
  } catch (error) {
    console.error("Get Recent Threats Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error fetching threats.",
    });
  }
};

// GET /api/dashboard/reports
const getReports = async (req, res) => {
  try {
    const { reports } = await getScopedData(req.user);
    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Get Reports Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error fetching reports.",
    });
  }
};

module.exports = {
  getDashboard,
  getStats,
  getRecentThreats,
  getReports,
};