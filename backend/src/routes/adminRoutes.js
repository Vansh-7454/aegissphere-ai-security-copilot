const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

const {
  getAdminDashboard,
  getAdminUsers,
  getAdminUserById,
  updateUserStatus,
  getAdminThreats,
  getAdminIncidents,
  getAdminReports,
  getAdminAgents,
  getAdminAuditLogs,
  getAdminSystemHealth,
} = require("../controllers/adminController");

// Enforce strict JWT authentication and Admin role check across all /api/admin endpoints
router.use(protect);
router.use(requireAdmin);

// Dashboard Overview
router.get("/dashboard", getAdminDashboard);

// User Management
router.get("/users", getAdminUsers);
router.get("/users/:id", getAdminUserById);
router.patch("/users/:id/status", updateUserStatus);

// Platform-wide Threat Analytics
router.get("/threats", getAdminThreats);

// Platform-wide Incident Overview
router.get("/incidents", getAdminIncidents);

// Platform-wide Reports
router.get("/reports", getAdminReports);

// Multi-Agent Pipeline Telemetry
router.get("/agents", getAdminAgents);

// Administrative Audit Trail
router.get("/audit-logs", getAdminAuditLogs);

// Real System Health Diagnostics
router.get("/system-health", getAdminSystemHealth);
router.get("/health", getAdminSystemHealth);

module.exports = router;

