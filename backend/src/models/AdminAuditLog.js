const mongoose = require("mongoose");

const adminAuditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    actorEmail: {
      type: String,
      required: true,
    },

    actorRole: {
      type: String,
      default: "Admin",
    },

    action: {
      type: String,
      required: true,
      trim: true,
    },

    targetType: {
      type: String,
      default: "General",
    },

    targetId: {
      type: String,
      default: null,
    },

    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },

    result: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

adminAuditLogSchema.index({ createdAt: -1 });
adminAuditLogSchema.index({ action: 1 });
adminAuditLogSchema.index({ actor: 1 });

module.exports = mongoose.model("AdminAuditLog", adminAuditLogSchema);
