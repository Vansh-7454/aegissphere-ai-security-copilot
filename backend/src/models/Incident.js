const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    incidentId: {
      type: String,
      required: true,
      unique: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Open", "In Progress", "Investigating", "Contained", "Mitigated", "Resolved", "Closed"],
      default: "Open",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    threatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Threat",
    },

    logId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Log",
    },

    actionHistory: [
      {
        action: { type: String, required: true },
        status: { type: String, default: "Recorded" },
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        performedByName: { type: String, default: "SOC Operator" },
        timestamp: { type: Date, default: Date.now },
        notes: { type: String, default: "" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Incident", incidentSchema);
