const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Log = require("../models/Log");
const Threat = require("../models/Threat");
const Report = require("../models/Report");
const Incident = require("../models/Incident");
const { orchestrateAnalysis } = require("../agents/AgentOrchestrator");

// POST /api/logs/upload
const uploadLog = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No log file provided for ingestion.",
      });
    }

    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, "utf8");
    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileSize = req.file.size;

    // Execute genuine 4-stage multi-agent analysis pipeline
    const analysisResult = await orchestrateAnalysis(fileContent, {
      fileFormat: ext,
      originalName: req.file.originalname,
    });

    const hasThreat = analysisResult.isThreat === true;
    let threat = null;
    let incident = null;

    if (hasThreat) {
      // Create real Threat Document with multi-agent evidence
      threat = await Threat.create({
        threatType: analysisResult.threatType,
        severity: analysisResult.severity,
        confidence: analysisResult.confidence,
        confidenceReason: analysisResult.confidenceReason,
        matchedIndicators: analysisResult.matchedIndicators,
        description: analysisResult.description,
        recommendation: analysisResult.recommendation,
        mitreTechnique: analysisResult.mitreTechnique || "T1059",
        sourceIp: analysisResult.sourceIp || null,
        status: "Active",
      });
    }

    // Create Log Document strictly assigned to authenticated user
    const log = await Log.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: fileSize,
      fileFormat: ext,
      uploadedBy: req.user.id,
      status: "Completed",
      threatCount: hasThreat ? 1 : 0,
      analysis: threat ? threat._id : null,
    });

    // Link logId back to Threat if created
    if (threat) {
      threat.logId = log._id;
      await threat.save();
    }

    // Create automatically associated Report
    const report = await Report.create({
      title: `SOC Audit Report - ${req.file.originalname}`,
      generatedBy: req.user.id,
      logId: log._id,
      summary: hasThreat
        ? `${analysisResult.threatType} (${analysisResult.severity}) identified in ${req.file.originalname} with ${analysisResult.confidence}% calculated confidence. Matched indicators: ${(analysisResult.matchedIndicators || []).join(', ')}.`
        : `Security audit of ${req.file.originalname} completed. No suspicious patterns or known attack signatures detected in log telemetry.`,
      threatCount: hasThreat ? 1 : 0,
      criticalCount: hasThreat && analysisResult.severity === "Critical" ? 1 : 0,
      status: "Generated",
    });

    // If High or Critical threat detected, create initial Incident record for triage
    if (hasThreat && (analysisResult.severity === "Critical" || analysisResult.severity === "High")) {
      incident = await Incident.create({
        incidentId: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
        title: `${analysisResult.threatType} on ${req.file.originalname}`,
        severity: analysisResult.severity,
        status: "Open",
        assignedTo: req.user.id,
        threatId: threat._id,
        logId: log._id,
      });
    }

    res.status(200).json({
      success: true,
      message: hasThreat
        ? `Threat detected: ${analysisResult.threatType} (${analysisResult.severity} Severity, ${analysisResult.confidence}% confidence)`
        : "Log file analyzed: No suspicious security events or anomalies detected.",
      log,
      threat,
      report,
      incident,
      agentTelemetry: analysisResult.agentTelemetry,
    });
  } catch (error) {
    console.error("Upload Log Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error during log upload and processing.",
    });
  }
};

// GET /api/logs - Strictly user-isolated
const getLogs = async (req, res) => {
  try {
    const logs = await Log.find({ uploadedBy: req.user.id })
      .populate("uploadedBy", "name email role")
      .populate("analysis")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("Get Logs Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error fetching log history.",
    });
  }
};

// GET /api/logs/:id - Strictly check ownership
const getLogById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid log ID format.",
      });
    }

    const log = await Log.findById(id)
      .populate("uploadedBy", "name email role")
      .populate("analysis");

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Log file record not found.",
      });
    }

    if (log.uploadedBy._id.toString() !== req.user.id && log.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: You do not have permission to view this log file.",
      });
    }

    res.status(200).json({
      success: true,
      log,
    });
  } catch (error) {
    console.error("Get Log By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error fetching log file.",
    });
  }
};

// DELETE /api/logs/:id (Complete Cascade Delete - Owner only)
const deleteLog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid log ID format.",
      });
    }

    const log = await Log.findById(id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Log file record not found.",
      });
    }

    // Strict owner verification
    if (log.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: You are not authorized to delete this log file.",
      });
    }

    // 1. Delete physical file if exists
    const candidateDirs = [
      path.resolve(__dirname, "../../uploads"),
      path.resolve(__dirname, "../uploads"),
    ];
    for (const dir of candidateDirs) {
      const targetPath = path.join(dir, log.filename);
      if (fs.existsSync(targetPath)) {
        try {
          fs.unlinkSync(targetPath);
        } catch (err) {
          console.warn("Physical file deletion warning:", err.message);
        }
      }
    }

    // 2. Cascade delete associated Threat(s)
    if (log.analysis) {
      await Threat.findByIdAndDelete(log.analysis);
    }
    await Threat.deleteMany({ logId: log._id });

    // 3. Cascade delete associated Reports
    await Report.deleteMany({ logId: log._id });

    // 4. Cascade delete associated Incidents
    await Incident.deleteMany({ logId: log._id });

    // 5. Delete Log document itself
    await Log.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Log file and all associated security records deleted cleanly.",
    });
  } catch (error) {
    console.error("Delete Log Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error deleting log file.",
    });
  }
};

module.exports = {
  uploadLog,
  getLogs,
  getLogById,
  deleteLog,
};