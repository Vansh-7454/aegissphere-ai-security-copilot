/**
 * incident_integration_test.js
 * Comprehensive Integration & Verification Test Suite for Phase 4 Incident Response.
 */

const mongoose = require("mongoose");
const path = require("path");

const API_BASE = "http://127.0.0.1:5000/api";
const MONGO_URI = "mongodb://127.0.0.1:27017/aegissphere";

const Log = require("../models/Log");
const Threat = require("../models/Threat");
const Incident = require("../models/Incident");
const User = require("../models/User");

let adminToken = "";
let analystToken = "";
let adminUser = null;
let analystUser = null;

let testThreat = null;
let testLog = null;
let testIncident = null;

const runIncidentTestSuite = async () => {
  console.log("================================================================================");
  console.log("AEGISSPHERE PHASE 4: INCIDENT RESPONSE BACKEND INTEGRATION TEST SUITE");
  console.log("================================================================================\n");

  await mongoose.connect(MONGO_URI);
  console.log("✓ Connected to MongoDB.\n");

  const ts = Date.now();

  // 1. Authenticate Admin
  const adminEmail = `admin_tester_${ts}@aegissphere.io`;
  const adminReg = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Admin Lead", email: adminEmail, password: "Password123!", role: "Admin" }),
  });
  const adminData = await adminReg.json();
  adminToken = adminData.token;
  adminUser = adminData.user;

  // 2. Authenticate Analyst
  const analystEmail = `analyst_tester_${ts}@aegissphere.io`;
  const analystReg = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "SOC Analyst", email: analystEmail, password: "Password123!" }),
  });
  const analystData = await analystReg.json();
  analystToken = analystData.token;
  analystUser = analystData.user;
  const analystUserId = (analystUser._id || analystUser.id).toString();
  const adminUserId = (adminUser._id || adminUser.id).toString();

  console.log(`1. Authenticated User 1: ${adminEmail} (Role: Analyst)`);
  console.log(`2. Authenticated User 2: ${analystEmail} (Role: Analyst)\n`);

  const adminHeaders = { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" };
  const analystHeaders = { Authorization: `Bearer ${analystToken}`, "Content-Type": "application/json" };

  const testResults = [];

  const recordResult = (name, passed, details = {}) => {
    testResults.push({ name, passed, details });
    if (passed) {
      console.log(`   [PASS] ${name}`);
    } else {
      console.log(`   [FAIL] ${name} -> ${JSON.stringify(details)}`);
    }
  };

  // Setup initial Log and Threat in MongoDB for Incident testing
  testLog = await Log.create({
    filename: `audit_log_${ts}.log`,
    originalName: "auth_gateway_access.log",
    fileSize: 1024,
    fileFormat: ".log",
    uploadedBy: adminUserId,
    status: "Completed",
    threatCount: 1,
  });

  testThreat = await Threat.create({
    threatType: "SQL Injection Payload",
    severity: "High",
    confidence: 85,
    confidenceReason: "SQL syntax manipulation tokens detected",
    matchedIndicators: ["UNION SELECT query payload"],
    sourceIp: "198.51.100.88",
    mitreTechnique: "T1190",
    status: "Active",
    logId: testLog._id,
  });

  testLog.analysis = testThreat._id;
  await testLog.save();

  // --------------------------------------------------------------------------
  // SECTION 1: CREATE INCIDENT (POST /api/incidents)
  // --------------------------------------------------------------------------
  console.log("--- 1. AUDITING INCIDENT CREATION (POST /api/incidents) ---");

  // Test 1.1: Valid incident creation from real Threat
  const createRes = await fetch(`${API_BASE}/incidents`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      title: "SQL Injection on Primary Authentication Gateway",
      severity: "High",
      threatId: testThreat._id.toString(),
      logId: testLog._id.toString(),
      assignedTo: analystUserId,
      description: "Automated triage ticket opened for suspected SQLi.",
    }),
  });
  const createData = await createRes.json();
  testIncident = createData.incident;

  const createPass = (
    createRes.status === 201 &&
    createData.success === true &&
    testIncident !== null &&
    testIncident.title.includes("SQL Injection") &&
    testIncident.severity === "High" &&
    testIncident.status === "Open" &&
    (testIncident.threatId._id || testIncident.threatId).toString() === testThreat._id.toString() &&
    (testIncident.logId._id || testIncident.logId).toString() === testLog._id.toString() &&
    (testIncident.assignedTo._id || testIncident.assignedTo).toString() === adminUserId &&
    Array.isArray(testIncident.actionHistory) &&
    testIncident.actionHistory.length === 1
  );
  recordResult("POST /api/incidents creates ticket with verified Threat, Log, and User links", createPass, {
    incidentId: testIncident?.incidentId,
    title: testIncident?.title,
  });

  // Test 1.2: Reject non-existent Threat ID
  const fakeThreatId = new mongoose.Types.ObjectId().toString();
  const nonExistThreatRes = await fetch(`${API_BASE}/incidents`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      title: "Orphan Incident",
      threatId: fakeThreatId,
    }),
  });
  recordResult("POST /api/incidents rejects non-existent threatId (404 Not Found)", nonExistThreatRes.status === 404);

  // Test 1.3: Reject invalid ObjectId format
  const badIdRes = await fetch(`${API_BASE}/incidents`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      title: "Invalid ID Incident",
      threatId: "not-a-valid-id",
    }),
  });
  recordResult("POST /api/incidents rejects malformed ObjectId format (400 Bad Request)", badIdRes.status === 400);

  // --------------------------------------------------------------------------
  // SECTION 2: READ INCIDENTS (GET /api/incidents & GET /api/incidents/:id)
  // --------------------------------------------------------------------------
  console.log("\n--- 2. AUDITING INCIDENT LIST & RETRIEVAL (GET /api/incidents) ---");

  // Test 2.1: GET /api/incidents
  const listRes = await fetch(`${API_BASE}/incidents`, { headers: adminHeaders });
  const listData = await listRes.json();
  const listPass = (
    listRes.status === 200 &&
    listData.success === true &&
    Array.isArray(listData.incidents) &&
    listData.incidents.some((i) => i._id.toString() === testIncident._id.toString())
  );
  recordResult("GET /api/incidents returns populated incident array from MongoDB", listPass, { count: listData.count });

  // Test 2.2: GET /api/incidents with status filter
  const filterRes = await fetch(`${API_BASE}/incidents?status=Open`, { headers: adminHeaders });
  const filterData = await filterRes.json();
  const filterPass = (
    filterRes.status === 200 &&
    filterData.incidents.every((i) => i.status === "Open")
  );
  recordResult("GET /api/incidents?status=Open filters accurately on MongoDB query", filterPass);

  // Test 2.3: GET /api/incidents/:id
  const getOneRes = await fetch(`${API_BASE}/incidents/${testIncident._id}`, { headers: adminHeaders });
  const getOneData = await getOneRes.json();
  const getOnePass = (
    getOneRes.status === 200 &&
    getOneData.success === true &&
    getOneData.incident.incidentId === testIncident.incidentId &&
    getOneData.incident.threatId.sourceIp === "198.51.100.88"
  );
  recordResult("GET /api/incidents/:id retrieves populated single incident document", getOnePass);

  // --------------------------------------------------------------------------
  // SECTION 3: UPDATE & LIFECYCLE (PATCH /api/incidents/:id)
  // --------------------------------------------------------------------------
  console.log("\n--- 3. AUDITING INCIDENT STATUS LIFECYCLE (PATCH /api/incidents/:id) ---");

  // Test 3.1: Update status to 'Investigating'
  const updateStatusRes = await fetch(`${API_BASE}/incidents/${testIncident._id}`, {
    method: "PATCH",
    headers: adminHeaders,
    body: JSON.stringify({
      status: "Investigating",
      notes: "Analyst actively investigating database connection logs.",
    }),
  });
  const updateStatusData = await updateStatusRes.json();
  const statusUpdatePass = (
    updateStatusRes.status === 200 &&
    updateStatusData.success === true &&
    updateStatusData.incident.status === "Investigating" &&
    updateStatusData.incident.actionHistory.length === 2
  );
  recordResult("PATCH /api/incidents/:id transitions lifecycle to 'Investigating' with audit log", statusUpdatePass);

  // Test 3.2: Reject invalid status enum
  const invalidStatusRes = await fetch(`${API_BASE}/incidents/${testIncident._id}`, {
    method: "PATCH",
    headers: adminHeaders,
    body: JSON.stringify({ status: "InvalidFakeStatus" }),
  });
  recordResult("PATCH /api/incidents/:id rejects invalid status enum (400 Bad Request)", invalidStatusRes.status === 400);

  // --------------------------------------------------------------------------
  // SECTION 4: RESPONSE ACTIONS & AUDIT TRAIL (POST /api/incidents/:id/actions)
  // --------------------------------------------------------------------------
  console.log("\n--- 4. AUDITING CONTAINMENT PLAYBOOK ACTIONS (POST /api/incidents/:id/actions) ---");

  // Test 4.1: Record 'Edge WAF IP Blacklist' action
  const actionRes = await fetch(`${API_BASE}/incidents/${testIncident._id}/actions`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      action: "Edge WAF IP Blacklist",
      notes: "Blacklisted 198.51.100.88 at perimeter gateway in response to SQLi.",
    }),
  });
  const actionData = await actionRes.json();

  // Also verify Threat.status synchronized to 'Mitigated'
  const syncedThreat = await Threat.findById(testThreat._id);

  const actionPass = (
    actionRes.status === 200 &&
    actionData.success === true &&
    actionData.incident.status === "Mitigated" &&
    actionData.incident.actionHistory.some((a) => a.action === "Edge WAF IP Blacklist") &&
    syncedThreat.status === "Mitigated"
  );
  recordResult("POST /api/incidents/:id/actions records action in audit trail and syncs Threat status", actionPass, {
    incidentStatus: actionData.incident?.status,
    threatStatus: syncedThreat?.status,
  });

  // --------------------------------------------------------------------------
  // SECTION 5: DELETE INCIDENT ONLY (DELETE /api/incidents/:id)
  // --------------------------------------------------------------------------
  console.log("\n--- 5. AUDITING INCIDENT DELETION & TELEMETRY PRESERVATION ---");

  const delRes = await fetch(`${API_BASE}/incidents/${testIncident._id}`, {
    method: "DELETE",
    headers: adminHeaders,
  });
  const delData = await delRes.json();

  // Verify Incident is deleted from MongoDB
  const checkIncident = await Incident.findById(testIncident._id);
  // Verify Threat and Log are PRESERVED (NOT deleted)
  const checkThreat = await Threat.findById(testThreat._id);
  const checkLog = await Log.findById(testLog._id);

  const deletePass = (
    delRes.status === 200 &&
    delData.success === true &&
    checkIncident === null &&
    checkThreat !== null &&
    checkLog !== null
  );
  recordResult("DELETE /api/incidents/:id deletes ticket while strictly preserving underlying Threat & Log", deletePass, {
    incidentDeleted: checkIncident === null,
    threatPreserved: checkThreat !== null,
    logPreserved: checkLog !== null,
  });

  // --------------------------------------------------------------------------
  // SECTION 6: AUTHENTICATION & ACCESS CONTROL
  // --------------------------------------------------------------------------
  console.log("\n--- 6. AUDITING AUTHENTICATION & ACCESS CONTROL ---");

  // Test 6.1: Unauthenticated request rejected with 401
  const unauthRes = await fetch(`${API_BASE}/incidents`);
  recordResult("Unauthenticated access to /api/incidents returns 401 Unauthorized", unauthRes.status === 401);

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log("\n================================================================================");
  const totalTests = testResults.length;
  const passedTests = testResults.filter((t) => t.passed).length;
  const failedTests = testResults.filter((t) => !t.passed).length;

  console.log(`INCIDENT SUITE COMPLETE: ${passedTests}/${totalTests} TESTS PASSED (${failedTests} FAILED)`);
  console.log("================================================================================\n");

  await mongoose.disconnect();
};

runIncidentTestSuite().catch((err) => {
  console.error("FATAL INCIDENT SUITE ERROR:", err);
  process.exit(1);
});
