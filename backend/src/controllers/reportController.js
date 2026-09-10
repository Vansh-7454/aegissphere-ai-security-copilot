const mongoose = require("mongoose");
const Report = require("../models/Report");
const Log = require("../models/Log");
const Threat = require("../models/Threat");
const Incident = require("../models/Incident");
const User = require("../models/User");
const PdfReportService = require("../services/PdfReportService");

// Helper to check user permission on a report (Strict Owner Check, Admin Bypass)
const isUserAuthorizedForReport = (user, report) => {
  if (!user || !report) return false;

  // Administrators have platform-wide report viewing & download authority
  if (user.role && user.role.toLowerCase() === 'admin') {
    return true;
  }

  const userIdStr = user.id || (user._id && user._id.toString());

  const generatorIdStr =
    report.generatedBy &&
    (report.generatedBy._id ? report.generatedBy._id.toString() : report.generatedBy.toString());

  if (generatorIdStr === userIdStr) {
    return true;
  }

  if (report.logId) {
    const uploaderIdStr =
      report.logId.uploadedBy &&
      (report.logId.uploadedBy._id
        ? report.logId.uploadedBy._id.toString()
        : report.logId.uploadedBy.toString());
    if (uploaderIdStr === userIdStr) {
      return true;
    }
  }

  return false;
};

// GET /api/reports - List reports strictly scoped to authenticated user
const getReports = async (req, res) => {
  try {
    const userLogs = await Log.find({ uploadedBy: req.user.id }).select("_id");
    const userLogIds = userLogs.map((l) => l._id);

    const reports = await Report.find({
      $or: [{ generatedBy: req.user.id }, { logId: { $in: userLogIds } }],
    })
      .populate("generatedBy", "name email role")
      .populate("logId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Get Reports Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching reports.",
    });
  }
};

// GET /api/reports/:id - Get single report metadata with strict ownership check
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID format.",
      });
    }

    const report = await Report.findById(id)
      .populate("generatedBy", "name email role")
      .populate("logId");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    if (!isUserAuthorizedForReport(req.user, report)) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: You do not have permission to view this report.",
      });
    }

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Get Report By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving report.",
    });
  }
};

// GET /api/reports/:id/pdf - Stream genuine PDF report strictly enforcing ownership
const getReportPdf = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID format.",
      });
    }

    const report = await Report.findById(id)
      .populate("generatedBy", "name email role")
      .populate("logId");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    if (!isUserAuthorizedForReport(req.user, report)) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: You do not have permission to download this report.",
      });
    }

    // Retrieve related Threats and Incidents strictly for this log
    let threats = [];
    let incidents = [];

    if (report.logId) {
      const logDocId = report.logId._id || report.logId;
      threats = await Threat.find({ logId: logDocId }).sort({ createdAt: -1 });
      const threatIds = threats.map((t) => t._id);

      incidents = await Incident.find({
        $or: [{ logId: logDocId }, { threatId: { $in: threatIds } }],
      })
        .populate("assignedTo", "name email role")
        .populate("actionHistory.performedBy", "name email role")
        .sort({ createdAt: -1 });
    }

    // Set HTTP Response Headers for PDF Streaming
    const sanitizedTitle = (report.title || `report_${report._id}`)
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .toLowerCase();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="aegissphere-${sanitizedTitle}-${report._id}.pdf"`
    );

    // Stream PDF directly to client
    PdfReportService.generateReportPdf(
      {
        report,
        log: report.logId,
        threats,
        incidents,
        requestingUser: req.user,
      },
      res
    );
  } catch (error) {
    console.error("Generate Report PDF Error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Server error generating PDF report.",
      });
    }
  }
};

// DELETE /api/reports/:id - Delete single report (Strict owner only)
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID format.",
      });
    }

    const report = await Report.findById(id).populate("logId");
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    if (!isUserAuthorizedForReport(req.user, report)) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: You do not have permission to delete this report.",
      });
    }

    await Report.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Report deleted successfully. Telemetry and threat logs preserved.",
    });
  } catch (error) {
    console.error("Delete Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting report.",
    });
  }
};

module.exports = {
  getReports,
  getReportById,
  getReportPdf,
  deleteReport,
};
