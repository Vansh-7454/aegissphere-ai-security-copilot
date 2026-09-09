const mongoose = require("mongoose");

const threatSchema = new mongoose.Schema(
  {
    logId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Log",
    },

    threatType: {
      type: String,
      required: true,
    },

    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      required: true,
    },

    confidence: {
      type: Number,
      required: true,
    },

    confidenceReason: {
      type: String,
    },

    matchedIndicators: {
      type: [String],
      default: [],
    },

    description: {
      type: String,
    },

    recommendation: {
      type: String,
    },

    mitreTechnique: {
      type: String,
      default: "T1059",
    },

    sourceIp: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["Active", "Investigating", "Mitigated", "Resolved", "Closed"],
      default: "Active",
    },

    aiAnalysis: {
      summary: { type: String, default: null },
      whySuspicious: { type: [String], default: [] },
      observedEvidence: { type: [String], default: [] },
      investigationSteps: { type: [String], default: [] },
      remediation: { type: [String], default: [] },
      riskContext: { type: String, default: null },
      uncertainty: { type: String, default: null },
      confidenceInAnalysis: { type: String, enum: ["low", "medium", "high", null], default: null },
      generatedAt: { type: Date, default: null },
      model: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Threat", threatSchema);