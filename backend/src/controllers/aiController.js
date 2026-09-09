/**
 * aiController.js
 * Controller for AI-assisted security analysis endpoints.
 */

const mongoose = require("mongoose");
const Threat = require("../models/Threat");
const Log = require("../models/Log");
const { analyzeThreatWithGemini, isConfigured } = require("../services/GeminiService");

/**
 * POST /api/ai/analyze-threat/:threatId
 * Generates or retrieves AI-assisted security analysis for a specific threat.
 */
const analyzeThreat = async (req, res) => {
  try {
    const { threatId } = req.params;
    const forceRefresh = req.query.refresh === "true";

    if (!mongoose.Types.ObjectId.isValid(threatId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid threat ID format.",
      });
    }

    const threat = await Threat.findById(threatId).populate("logId");
    if (!threat) {
      return res.status(404).json({
        success: false,
        message: "Threat record not found.",
      });
    }

    // Strict ownership access control check
    if (threat.logId && threat.logId.uploadedBy) {
      const uploaderId = threat.logId.uploadedBy.toString();
      if (uploaderId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Access Denied: You do not have permission to access AI analysis for this threat.",
        });
      }
    }

    // 1. Return cached AI analysis if already present and refresh not forced
    if (threat.aiAnalysis && threat.aiAnalysis.summary && !forceRefresh) {
      return res.status(200).json({
        success: true,
        aiAvailable: true,
        fromCache: true,
        message: "Retrieved cached AI-assisted analysis.",
        aiAnalysis: threat.aiAnalysis,
        threat: {
          _id: threat._id,
          threatType: threat.threatType,
          severity: threat.severity,
          confidence: threat.confidence,
          mitreTechnique: threat.mitreTechnique,
          sourceIp: threat.sourceIp,
        },
      });
    }

    // 2. Fetch associated Log context if available
    const logContext = threat.logId || {};

    // 3. Dispatch to GeminiService
    const aiResult = await analyzeThreatWithGemini(threat, logContext);

    // 4. If AI analysis succeeded, persist in MongoDB
    if (aiResult.success && aiResult.data) {
      threat.aiAnalysis = aiResult.data;
      await threat.save();

      return res.status(200).json({
        success: true,
        aiAvailable: true,
        fromCache: false,
        message: "AI-assisted analysis generated successfully.",
        aiAnalysis: threat.aiAnalysis,
        model: aiResult.model,
        threat: {
          _id: threat._id,
          threatType: threat.threatType,
          severity: threat.severity,
          confidence: threat.confidence,
          mitreTechnique: threat.mitreTechnique,
          sourceIp: threat.sourceIp,
        },
      });
    }

    // 5. If AI analysis is unavailable, return safe fallback state without failing
    return res.status(200).json({
      success: true,
      aiAvailable: false,
      fromCache: false,
      reason: aiResult.reason || "AI analysis unavailable.",
      model: aiResult.model,
      threat: {
        _id: threat._id,
        threatType: threat.threatType,
        severity: threat.severity,
        confidence: threat.confidence,
        mitreTechnique: threat.mitreTechnique,
        sourceIp: threat.sourceIp,
      },
    });
  } catch (error) {
    console.error("Analyze Threat AI Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while processing AI analysis.",
    });
  }
};

/**
 * GET /api/ai/status
 * Returns current Gemini AI service availability and model status.
 */
const getAiStatus = async (req, res) => {
  const configured = isConfigured();
  return res.status(200).json({
    success: true,
    service: "Google Gemini AI-Assisted Security Analysis",
    configured,
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    status: configured ? "Configured & Ready" : "Unconfigured (Set GEMINI_API_KEY)",
  });
};

module.exports = {
  analyzeThreat,
  getAiStatus,
};
