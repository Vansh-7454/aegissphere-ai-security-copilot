const mongoose = require("mongoose");
const Threat = require("../models/Threat");
const Log = require("../models/Log");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * GET /api/threats
 * Retrieves list of threats strictly belonging to the authenticated user's uploaded logs.
 */
const getThreats = async (req, res) => {
  try {
    const userLogs = await Log.find({ uploadedBy: req.user.id }).select("_id");
    const userLogIds = userLogs.map((l) => l._id);

    const { severity, status, search } = req.query;
    const filter = { logId: { $in: userLogIds } };

    if (severity && severity !== "All") {
      filter.severity = severity;
    }

    if (status && status !== "All") {
      filter.status = status;
    }

    if (search && typeof search === "string" && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { threatType: searchRegex },
        { mitreTechnique: searchRegex },
        { sourceIp: searchRegex },
        { description: searchRegex },
      ];
    }

    const threats = await Threat.find(filter)
      .populate("logId", "filename originalName fileFormat fileSize createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: threats.length,
      threats,
    });
  } catch (error) {
    console.error("Get Threats Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching threats.",
    });
  }
};

/**
 * GET /api/threats/:id
 * Retrieves a single threat by ID, strictly enforcing user ownership of the parent log.
 */
const getThreatById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid threat ID format.",
      });
    }

    const threat = await Threat.findById(id).populate("logId");

    if (!threat) {
      return res.status(404).json({
        success: false,
        message: "Threat record not found.",
      });
    }

    // Ownership check: must have linked log uploaded by this user
    if (threat.logId && threat.logId.uploadedBy) {
      const uploaderId = threat.logId.uploadedBy.toString();
      if (uploaderId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Access Denied: You do not have permission to view this threat.",
        });
      }
    }

    res.status(200).json({
      success: true,
      threat,
    });
  } catch (error) {
    console.error("Get Threat By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving threat.",
    });
  }
};

module.exports = {
  getThreats,
  getThreatById,
};
