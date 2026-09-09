const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      default: 0,
    },

    fileFormat: {
      type: String,
      default: ".log",
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Failed"],
      default: "Completed",
    },

    threatCount: {
      type: Number,
      default: 0,
    },

    analysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Threat",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Log", logSchema);