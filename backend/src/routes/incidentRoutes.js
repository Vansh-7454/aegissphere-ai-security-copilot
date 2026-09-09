const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  recordIncidentAction,
  deleteIncident,
} = require("../controllers/incidentController");

router.get("/", protect, getIncidents);
router.get("/:id", protect, getIncidentById);
router.post("/", protect, createIncident);
router.patch("/:id", protect, updateIncident);
router.patch("/:id/status", protect, updateIncident);
router.post("/:id/actions", protect, recordIncidentAction);
router.delete("/:id", protect, deleteIncident);

module.exports = router;
