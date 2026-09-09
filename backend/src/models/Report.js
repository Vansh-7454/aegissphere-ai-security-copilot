const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    logId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Log",
    },

    summary: {
      type: String,
    },

    threatCount: {
      type: Number,
      default: 0,
    },

    criticalCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      default: "Generated",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Report", reportSchema);
