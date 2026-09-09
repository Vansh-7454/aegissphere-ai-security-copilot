/**
 * incidentController.js
 * Comprehensive Controller for Real Incident Response Lifecycle & MongoDB Operations.
 * Fully user-isolated: analysts can only view, create, update, action, and delete their own incidents.
 */

const mongoose = require("mongoose");
const Incident = require("../models/Incident");
const Threat = require("../models/Threat");
const Log = require("../models/Log");
const User = require("../models/User");

// Helper to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper to verify if an incident belongs to the authenticated user
const isUserOwnerOfIncident = async (userId, incident) => {
  if (!incident) return false;
  const userIdStr = userId.toString();

  // Check assignedTo
  if (incident.assignedTo) {
    const assignedStr = incident.assignedTo._id ? incident.assignedTo._id.toString() : incident.assignedTo.toString();
    if (assignedStr === userIdStr) return true;
  }

  // Check log uploader
  if (incident.logId) {
    const logDoc = incident.logId.uploadedBy ? incident.logId : await Log.findById(incident.logId);
    if (logDoc && logDoc.uploadedBy) {
      const uploaderStr = logDoc.uploadedBy._id ? logDoc.uploadedBy._id.toString() : logDoc.uploadedBy.toString();
      if (uploaderStr === userIdStr) return true;
    }
  }

  // Check threat owner
  if (incident.threatId) {
    const threatDoc = await Threat.findById(incident.threatId).populate("logId");
    if (threatDoc && threatDoc.logId && threatDoc.logId.uploadedBy) {
      const uploaderStr = threatDoc.logId.uploadedBy._id
        ? threatDoc.logId.uploadedBy._id.toString()
        : threatDoc.logId.uploadedBy.toString();
      if (uploaderStr === userIdStr) return true;
    }
  }

  return false;
};

/**
 * GET /api/incidents
 * Retrieves all incidents strictly belonging to the authenticated user.
 */
const getIncidents = async (req, res) => {
  try {
    const { status, severity, threatId } = req.query;

    const userLogs = await Log.find({ uploadedBy: req.user.id }).select("_id");
    const userLogIds = userLogs.map((l) => l._id);

    const query = {
      $or: [{ assignedTo: req.user.id }, { logId: { $in: userLogIds } }],
    };

    if (status && status !== "All") {
      query.status = status;
    }

    if (severity && severity !== "All") {
      query.severity = severity;
    }

    if (threatId) {
      if (!isValidObjectId(threatId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid threatId parameter format.",
        });
      }
      query.threatId = threatId;
    }

    const incidents = await Incident.find(query)
      .populate("assignedTo", "name email role")
      .populate("threatId")
      .populate("logId")
      .populate("actionHistory.performedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: incidents.length,
      incidents,
    });
  } catch (error) {
    console.error("Get Incidents Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching incidents.",
    });
  }
};

/**
 * GET /api/incidents/:id
 * Retrieves a single incident by ID strictly verifying user ownership.
 */
const getIncidentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid incident ID format.",
      });
    }

    const incident = await Incident.findById(id)
      .populate("assignedTo", "name email role")
      .populate("threatId")
      .populate("logId")
      .populate("actionHistory.performedBy", "name email role");

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident record not found.",
      });
    }

    const isOwner = await isUserOwnerOfIncident(req.user.id, incident);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: You do not have permission to view this incident record.",
      });
    }

    res.status(200).json({
      success: true,
      incident,
    });
  } catch (error) {
    console.error("Get Incident By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching incident details.",
    });
  }
};

/**
 * POST /api/incidents
 * Creates a new incident strictly owned by the authenticated user.
 */
const createIncident = async (req, res) => {
  try {
    const { title, severity, threatId, logId, description } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Incident title is required.",
      });
    }

    const allowedSeverities = ["Low", "Medium", "High", "Critical"];
    const targetSeverity = severity && allowedSeverities.includes(severity) ? severity : "Medium";

    let verifiedThreat = null;
    let verifiedLog = null;

    // 1. Verify Threat belongs to caller if provided
    if (threatId) {
      if (!isValidObjectId(threatId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid threatId format.",
        });
      }
      verifiedThreat = await Threat.findById(threatId).populate("logId");
      if (!verifiedThreat) {
        return res.status(404).json({
          success: false,
          message: "Referenced Threat record does not exist.",
        });
      }
      if (verifiedThreat.logId && verifiedThreat.logId.uploadedBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Access Denied: You cannot create an incident for another user's threat.",
        });
      }
    }

    // 2. Verify Log belongs to caller if provided
    const targetLogId = logId || (verifiedThreat ? verifiedThreat.logId?._id : null);
    if (targetLogId) {
      if (!isValidObjectId(targetLogId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid logId format.",
        });
      }
      verifiedLog = await Log.findById(targetLogId);
      if (!verifiedLog) {
        return res.status(404).json({
          success: false,
          message: "Referenced Log record does not exist.",
        });
      }
      if (verifiedLog.uploadedBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Access Denied: You cannot create an incident for another user's log.",
        });
      }
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const incidentDisplayId = `INC-${randomSuffix}`;

    const incident = await Incident.create({
      incidentId: incidentDisplayId,
      title: title.trim(),
      description: description ? description.trim() : "",
      severity: targetSeverity,
      status: "Open",
      assignedTo: req.user.id,
      threatId: verifiedThreat ? verifiedThreat._id : null,
      logId: verifiedLog ? verifiedLog._id : null,
      actionHistory: [
        {
          action: "Incident Ticket Created",
          status: "Logged",
          performedBy: req.user.id,
          performedByName: req.user.name || "SOC Operator",
          timestamp: new Date(),
          notes: "Initial triage incident ticket logged.",
        },
      ],
    });

    const populated = await Incident.findById(incident._id)
      .populate("assignedTo", "name email role")
      .populate("threatId")
      .populate("logId");

    res.status(201).json({
      success: true,
      message: `Incident ${incidentDisplayId} created successfully.`,
      incident: populated,
    });
  } catch (error) {
    console.error("Create Incident Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error creating incident.",
    });
  }
};

/**
 * PATCH /api/incidents/:id
 * Updates incident properties strictly enforcing ownership.
 */
const updateIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, severity, title, description, actionName, notes } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid incident ID format.",
      });
    }

    const incident = await Incident.findById(id).populate("logId");
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident record not found.",
      });
    }

    const isOwner = await isUserOwnerOfIncident(req.user.id, incident);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: You do not have permission to update this incident.",
      });
    }

    const allowedStatuses = ["Open", "In Progress", "Investigating", "Contained", "Mitigated", "Resolved", "Closed"];
    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status value. Allowed: ${allowedStatuses.join(", ")}`,
        });
      }
      incident.status = status;
    }

    const allowedSeverities = ["Low", "Medium", "High", "Critical"];
    if (severity) {
      if (!allowedSeverities.includes(severity)) {
        return res.status(400).json({
          success: false,
          message: `Invalid severity value. Allowed: ${allowedSeverities.join(", ")}`,
        });
      }
      incident.severity = severity;
    }

    if (title && typeof title === "string" && title.trim()) {
      incident.title = title.trim();
    }

    if (description !== undefined) {
      incident.description = description ? description.trim() : "";
    }

    const actionLabel = actionName || (status ? `Status updated to ${status}` : "Incident record updated");
    incident.actionHistory.push({
      action: actionLabel,
      status: "Applied",
      performedBy: req.user.id,
      performedByName: req.user.name || "SOC Operator",
      timestamp: new Date(),
      notes: notes || "",
    });

    await incident.save();

    // Sync Threat status if linked
    if (incident.threatId) {
      const threatStatusMap = {
        Open: "Active",
        "In Progress": "Investigating",
        Investigating: "Investigating",
        Contained: "Mitigated",
        Mitigated: "Mitigated",
        Resolved: "Resolved",
        Closed: "Closed",
      };
      if (status && threatStatusMap[status]) {
        await Threat.findByIdAndUpdate(incident.threatId, {
          status: threatStatusMap[status],
        });
      }
    }

    const updated = await Incident.findById(id)
      .populate("assignedTo", "name email role")
      .populate("threatId")
      .populate("logId")
      .populate("actionHistory.performedBy", "name email role");

    res.status(200).json({
      success: true,
      message: `Incident ${incident.incidentId} updated successfully.`,
      incident: updated,
    });
  } catch (error) {
    console.error("Update Incident Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error updating incident.",
    });
  }
};

/**
 * POST /api/incidents/:id/actions
 * Records a containment action strictly verifying user ownership.
 */
const recordIncidentAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid incident ID format.",
      });
    }

    if (!action || typeof action !== "string" || !action.trim()) {
      return res.status(400).json({
        success: false,
        message: "Action name is required.",
      });
    }

    const incident = await Incident.findById(id).populate("logId");
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident record not found.",
      });
    }

    const isOwner = await isUserOwnerOfIncident(req.user.id, incident);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: You do not have permission to add actions to this incident.",
      });
    }

    incident.actionHistory.push({
      action: action.trim(),
      status: "Recorded",
      performedBy: req.user.id,
      performedByName: req.user.name || "SOC Operator",
      timestamp: new Date(),
      notes: notes || "Containment action recorded in audit trail.",
    });

    incident.status = "Mitigated";
    await incident.save();

    if (incident.threatId) {
      await Threat.findByIdAndUpdate(incident.threatId, {
        status: "Mitigated",
      });
    }

    const updated = await Incident.findById(id)
      .populate("assignedTo", "name email role")
      .populate("threatId")
      .populate("logId")
      .populate("actionHistory.performedBy", "name email role");

    res.status(200).json({
      success: true,
      message: `Response action [${action.trim()}] recorded in incident audit trail.`,
      incident: updated,
    });
  } catch (error) {
    console.error("Record Incident Action Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error recording response action.",
    });
  }
};

/**
 * DELETE /api/incidents/:id
 * Deletes an incident document ONLY, strictly verifying user ownership.
 */
const deleteIncident = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid incident ID format.",
      });
    }

    const incident = await Incident.findById(id).populate("logId");
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident record not found.",
      });
    }

    const isOwner = await isUserOwnerOfIncident(req.user.id, incident);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: You are not authorized to delete this incident.",
      });
    }

    await Incident.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Incident ${incident.incidentId} deleted successfully. Associated threat and log telemetry preserved.`,
    });
  } catch (error) {
    console.error("Delete Incident Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting incident.",
    });
  }
};

module.exports = {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  recordIncidentAction,
  deleteIncident,
  updateIncidentStatus: updateIncident,
};
