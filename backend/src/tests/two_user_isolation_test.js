/**
 * two_user_isolation_test.js
 * Comprehensive 2-User Security & Telemetry Isolation Test Suite.
 * Validates 100% personal SOC dashboard data isolation, zero cross-user leakage,
 * IDOR protection across all endpoints, and isolated multi-tenant campaign correlation.
 */

process.env.NODE_ENV = "test";

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const API_BASE = "http://127.0.0.1:5000/api";
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aegissphere";

const Log = require("../models/Log");
const Threat = require("../models/Threat");
const Incident = require("../models/Incident");
const Report = require("../models/Report");
const User = require("../models/User");

const runTwoUserIsolationSuite = async () => {
  console.log("================================================================================");
  console.log("AEGISSPHERE: TWO-USER PERSONAL SOC DATA ISOLATION VERIFICATION SUITE");
  console.log("================================================================================\n");

  await mongoose.connect(MONGO_URI);
  console.log("✓ Connected to MongoDB.\n");

  const ts = Date.now();
  const testResults = [];

  const recordResult = (name, passed, details = {}) => {
    testResults.push({ name, passed, details });
    if (passed) {
      console.log(`   [PASS] ${name}`);
    } else {
      console.log(`   [FAIL] ${name} -> ${JSON.stringify(details)}`);
    }
  };

  // --------------------------------------------------------------------------
  // 1. SETUP TWO INDEPENDENT USERS
  // --------------------------------------------------------------------------
  console.log("--- 1. REGISTERING INDEPENDENT ANALYST ACCOUNTS ---");

  const userAEmail = `analyst_alpha_${ts}@aegissphere.io`;
  const userBEmail = `analyst_beta_${ts}@aegissphere.io`;

  const regARes = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Analyst Alpha",
      email: userAEmail,
      password: "Password123!",
    }),
  });
  const regAData = await regARes.json();
  const tokenA = regAData.token;
  const userA = regAData.user;
  const userAId = (userA._id || userA.id).toString();
  const headersA = { Authorization: `Bearer ${tokenA}` };
  const jsonHeadersA = { Authorization: `Bearer ${tokenA}`, "Content-Type": "application/json" };

  const regBRes = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Analyst Beta",
      email: userBEmail,
      password: "Password123!",
    }),
  });
  const regBData = await regBRes.json();
  const tokenB = regBData.token;
  const userB = regBData.user;
  const userBId = (userB._id || userB.id).toString();
  const headersB = { Authorization: `Bearer ${tokenB}` };
  const jsonHeadersB = { Authorization: `Bearer ${tokenB}`, "Content-Type": "application/json" };

  recordResult("1. User A & User B register independently with default Analyst role", (
    regARes.status === 201 &&
    regBRes.status === 201 &&
    userA.role === "Analyst" &&
    userB.role === "Analyst" &&
    userAId !== userBId
  ), { userAId, userBId });

  // --------------------------------------------------------------------------
  // 2. LOG UPLOADS & MULTI-AGENT THREAT PIPELINE FOR EACH USER
  // --------------------------------------------------------------------------
  console.log("\n--- 2. LOG INGESTION & PIPELINE EXECUTION ---");

  // User A uploads Log 1: Clean Apache log (0 threats)
  const logA1Content = `192.168.1.50 - - [09/Sep/2026:10:00:00 +0000] "GET /index.html HTTP/1.1" 200 1024 "-" "Mozilla/5.0"\n192.168.1.51 - - [09/Sep/2026:10:00:01 +0000] "GET /assets/style.css HTTP/1.1" 200 456 "-" "Mozilla/5.0"`;
  const formA1 = new FormData();
  formA1.append("logFile", new Blob([logA1Content], { type: "text/plain" }), `userA_clean_${ts}.log`);
  const uploadA1Res = await fetch(`${API_BASE}/logs/upload`, { method: "POST", headers: headersA, body: formA1 });
  const uploadA1Data = await uploadA1Res.json();

  // User A uploads Log 2: XSS attack from 203.0.113.88
  const logA2Content = `203.0.113.88 - - [09/Sep/2026:10:01:00 +0000] "GET /search?q=%3Cscript%3Ealert(document.cookie)%3C/script%3E HTTP/1.1" 200 1450 "-" "Mozilla/5.0"`;
  const formA2 = new FormData();
  formA2.append("logFile", new Blob([logA2Content], { type: "text/plain" }), `userA_xss_${ts}.log`);
  const uploadA2Res = await fetch(`${API_BASE}/logs/upload`, { method: "POST", headers: headersA, body: formA2 });
  const uploadA2Data = await uploadA2Res.json();

  // User A uploads Log 3: SQL Injection attack log from 203.0.113.88
  const logA3Content = `203.0.113.88 - - [09/Sep/2026:10:05:00 +0000] "GET /api/user?id=1' UNION SELECT null,username,password FROM users-- HTTP/1.1" 500 240 "-" "sqlmap/1.4"`;
  const formA3 = new FormData();
  formA3.append("logFile", new Blob([logA3Content], { type: "text/plain" }), `userA_sqli_${ts}.log`);
  const uploadA3Res = await fetch(`${API_BASE}/logs/upload`, { method: "POST", headers: headersA, body: formA3 });
  const uploadA3Data = await uploadA3Res.json();

  // User B uploads Log 1: SSH Brute Force attack log from 198.51.100.22
  const logB1Content = `Sep  9 11:00:00 auth-srv sshd[101]: Failed password for invalid user admin from 198.51.100.22 port 44212 ssh2\nSep  9 11:00:01 auth-srv sshd[102]: Failed password for invalid user root from 198.51.100.22 port 44214 ssh2\nSep  9 11:00:02 auth-srv sshd[103]: Failed password for invalid user service from 198.51.100.22 port 44216 ssh2\nSep  9 11:00:03 auth-srv sshd[104]: Failed password for invalid user test from 198.51.100.22 port 44218 ssh2\nSep  9 11:00:04 auth-srv sshd[105]: Failed password for invalid user oracle from 198.51.100.22 port 44220 ssh2\nSep  9 11:00:05 auth-srv sshd[106]: Failed password for invalid user ubuntu from 198.51.100.22 port 44222 ssh2`;
  const formB1 = new FormData();
  formB1.append("logFile", new Blob([logB1Content], { type: "text/plain" }), `userB_ssh_brute_${ts}.log`);
  const uploadB1Res = await fetch(`${API_BASE}/logs/upload`, { method: "POST", headers: headersB, body: formB1 });
  const uploadB1Data = await uploadB1Res.json();

  // User B uploads Log 2: RCE command injection from 198.51.100.22
  const logB2Content = `198.51.100.22 - - [09/Sep/2026:11:05:00 +0000] "POST /cgi-bin/process.sh?cmd=cat%20/etc/passwd;nc%20-e%20/bin/sh HTTP/1.1" 200 4096 "-" "curl/7.68.0"`;
  const formB2 = new FormData();
  formB2.append("logFile", new Blob([logB2Content], { type: "text/plain" }), `userB_rce_${ts}.log`);
  const uploadB2Res = await fetch(`${API_BASE}/logs/upload`, { method: "POST", headers: headersB, body: formB2 });
  const uploadB2Data = await uploadB2Res.json();

  recordResult("2. User A and User B successfully ingest independent security logs", (
    uploadA1Res.status === 200 &&
    uploadA2Res.status === 200 &&
    uploadA3Res.status === 200 &&
    uploadB1Res.status === 200 &&
    uploadB2Res.status === 200
  ), {
    userALogs: [uploadA1Data.log?._id, uploadA2Data.log?._id, uploadA3Data.log?._id],
    userBLogs: [uploadB1Data.log?._id, uploadB2Data.log?._id],
  });

  const userALog1Id = uploadA1Data.log._id;
  const userALog2Id = uploadA2Data.log._id;
  const userALog3Id = uploadA3Data.log._id;
  const userBLog1Id = uploadB1Data.log._id;
  const userBLog2Id = uploadB2Data.log._id;

  // Retrieve Threats created for each user
  const userAThreats = await Threat.find({ logId: { $in: [userALog1Id, userALog2Id, userALog3Id] } });
  const userBThreats = await Threat.find({ logId: { $in: [userBLog1Id, userBLog2Id] } });

  recordResult("3. Multi-agent pipeline deterministically generated threat records per log", (
    userAThreats.length === 2 &&
    userBThreats.length === 2 &&
    userAThreats.every((t) => t.sourceIp === "203.0.113.88") &&
    userBThreats.every((t) => t.sourceIp === "198.51.100.22")
  ), {
    userAThreatCount: userAThreats.length,
    userBThreatCount: userBThreats.length,
  });

  const userAThreat = userAThreats[0];
  const userBThreat = userBThreats[0];

  const userAIncident = await Incident.findOne({ logId: { $in: [userALog2Id, userALog3Id] } });
  const userBIncident = await Incident.findOne({ logId: { $in: [userBLog1Id, userBLog2Id] } });
  const userAReport = await Report.findOne({ logId: userALog3Id });
  const userBReport = await Report.findOne({ logId: userBLog1Id });

  const userAIncidentId = userAIncident._id;
  const userBIncidentId = userBIncident._id;
  const userAReportId = userAReport._id;
  const userBReportId = userBReport._id;

  recordResult("4. Incident response tickets and executive SOC reports scoped to each user", (
    userAIncident !== null &&
    userBIncident !== null &&
    userAReport !== null &&
    userBReport !== null
  ), { userAIncidentId, userBIncidentId, userAReportId, userBReportId });

  // --------------------------------------------------------------------------
  // 3. DASHBOARD METRICS TELEMETRY ISOLATION AUDIT
  // --------------------------------------------------------------------------
  console.log("\n--- 3. AUDITING DASHBOARD METRICS ISOLATION ---");

  const dashARes = await fetch(`${API_BASE}/dashboard`, { headers: headersA });
  const dashAData = await dashARes.json();

  const dashBRes = await fetch(`${API_BASE}/dashboard`, { headers: headersB });
  const dashBData = await dashBRes.json();

  const dashAPass = (
    dashARes.status === 200 &&
    dashAData.stats.totalLogs === 3 &&
    (dashAData.stats.totalThreats === 2 || dashAData.stats.threatsDetected === 2) &&
    dashAData.stats.openIncidents >= 1 &&
    dashAData.recentThreats.length === 2 &&
    dashAData.recentThreats.every((t) => t.sourceIp === "203.0.113.88") &&
    dashAData.recentActivity.some((a) => a.id.includes(userALog1Id.toString()))
  );

  const dashBPass = (
    dashBRes.status === 200 &&
    dashBData.stats.totalLogs === 2 &&
    (dashBData.stats.totalThreats === 2 || dashBData.stats.threatsDetected === 2) &&
    dashBData.stats.openIncidents >= 1 &&
    dashBData.recentThreats.length === 2 &&
    dashBData.recentThreats.every((t) => t.sourceIp === "198.51.100.22") &&
    dashBData.recentActivity.some((a) => a.id.includes(userBLog1Id.toString()))
  );

  recordResult("5. User A dashboard reflects exactly 3 logs, 2 threats, 0 User B data", dashAPass, dashAData.stats);
  recordResult("6. User B dashboard reflects exactly 2 logs, 2 threats, 0 User A data", dashBPass, dashBData.stats);

  // --------------------------------------------------------------------------
  // 4. RESOURCE LISTS ISOLATION AUDIT (/logs, /threats, /incidents, /reports)
  // --------------------------------------------------------------------------
  console.log("\n--- 4. AUDITING RESOURCE LIST SCOPING ---");

  const logsARes = await fetch(`${API_BASE}/logs`, { headers: headersA });
  const logsAData = await logsARes.json();
  const logsBRes = await fetch(`${API_BASE}/logs`, { headers: headersB });
  const logsBData = await logsBRes.json();

  const threatsARes = await fetch(`${API_BASE}/threats`, { headers: headersA });
  const threatsAData = await threatsARes.json();
  const threatsBRes = await fetch(`${API_BASE}/threats`, { headers: headersB });
  const threatsBData = await threatsBRes.json();

  const incsARes = await fetch(`${API_BASE}/incidents`, { headers: headersA });
  const incsAData = await incsARes.json();
  const incsBRes = await fetch(`${API_BASE}/incidents`, { headers: headersB });
  const incsBData = await incsBRes.json();

  const repsARes = await fetch(`${API_BASE}/reports`, { headers: headersA });
  const repsAData = await repsARes.json();
  const repsBRes = await fetch(`${API_BASE}/reports`, { headers: headersB });
  const repsBData = await repsBRes.json();

  const resourceListsPass = (
    logsAData.logs.length === 3 &&
    logsBData.logs.length === 2 &&
    threatsAData.threats.length === 2 &&
    threatsBData.threats.length === 2 &&
    threatsAData.threats.every((t) => t.sourceIp === "203.0.113.88") &&
    threatsBData.threats.every((t) => t.sourceIp === "198.51.100.22") &&
    incsAData.incidents.length >= 1 &&
    incsBData.incidents.length >= 1 &&
    incsAData.incidents.every((inc) => inc.assignedTo?._id?.toString() === userAId || inc.assignedTo?.toString() === userAId) &&
    incsBData.incidents.every((inc) => inc.assignedTo?._id?.toString() === userBId || inc.assignedTo?.toString() === userBId) &&
    repsAData.reports.length === 3 &&
    repsBData.reports.length === 2
  );

  recordResult("7. All resource list queries strictly scoped to authenticated caller", resourceListsPass, {
    userALogs: logsAData.logs?.length,
    userBLogs: logsBData.logs?.length,
    userAThreats: threatsAData.threats?.length,
    userBThreats: threatsBData.threats?.length,
  });

  // --------------------------------------------------------------------------
  // 5. INSECURE DIRECT OBJECT REFERENCE (IDOR) CROSS-TENANT PREVENTION AUDIT
  // --------------------------------------------------------------------------
  console.log("\n--- 5. AUDITING IDOR / CROSS-USER DIRECT OBJECT ACCESS DEFENSE ---");

  // User A tries to view User B's Log
  const idorLogRes = await fetch(`${API_BASE}/logs/${userBLog1Id}`, { headers: headersA });
  recordResult("8. IDOR Prevention: User A accessing User B's Log returns 403/404 Forbidden", (idorLogRes.status === 403 || idorLogRes.status === 404), { status: idorLogRes.status });

  // User A tries to view User B's Threat
  const idorThreatRes = await fetch(`${API_BASE}/threats/${userBThreat._id}`, { headers: headersA });
  recordResult("9. IDOR Prevention: User A accessing User B's Threat returns 403/404 Forbidden", (idorThreatRes.status === 403 || idorThreatRes.status === 404), { status: idorThreatRes.status });

  // User A tries to view User B's Incident
  const idorIncRes = await fetch(`${API_BASE}/incidents/${userBIncidentId}`, { headers: headersA });
  recordResult("10. IDOR Prevention: User A accessing User B's Incident returns 403/404 Forbidden", (idorIncRes.status === 403 || idorIncRes.status === 404), { status: idorIncRes.status });

  // User A tries to view User B's Report metadata
  const idorRepRes = await fetch(`${API_BASE}/reports/${userBReportId}`, { headers: headersA });
  recordResult("11. IDOR Prevention: User A accessing User B's Report returns 403/404 Forbidden", (idorRepRes.status === 403 || idorRepRes.status === 404), { status: idorRepRes.status });

  // User A tries to stream/download User B's Report PDF binary
  const idorPdfRes = await fetch(`${API_BASE}/reports/${userBReportId}/pdf`, { headers: headersA });
  recordResult("12. IDOR Prevention: User A downloading User B's Report PDF returns 403/404 Forbidden", (idorPdfRes.status === 403 || idorPdfRes.status === 404), { status: idorPdfRes.status });

  // User A tries to trigger Gemini AI Analysis on User B's Threat
  const idorAiRes = await fetch(`${API_BASE}/ai/analyze-threat`, {
    method: "POST",
    headers: jsonHeadersA,
    body: JSON.stringify({ threatId: userBThreat._id }),
  });
  recordResult("13. IDOR Prevention: User A triggering AI Analysis on User B's Threat returns 403/404 Forbidden", (idorAiRes.status === 403 || idorAiRes.status === 404), { status: idorAiRes.status });

  // User A tries to delete User B's Log
  const idorDelLogRes = await fetch(`${API_BASE}/logs/${userBLog1Id}`, {
    method: "DELETE",
    headers: headersA,
  });
  recordResult("14. IDOR Prevention: User A deleting User B's Log returns 403/404 Forbidden", (idorDelLogRes.status === 403 || idorDelLogRes.status === 404), { status: idorDelLogRes.status });

  // --------------------------------------------------------------------------
  // 6. ROUTE CLEANUP & INCIDENT ACTION ISOLATION
  // --------------------------------------------------------------------------
  console.log("\n--- 6. AUDITING INCIDENT ACTION ISOLATION & CAMPAIGN REMOVAL ---");

  // Verify /api/campaigns endpoint returns 404 (feature removed completely)
  const campARes = await fetch(`${API_BASE}/campaigns`, { headers: headersA });
  recordResult("15. Attack Campaigns API is fully unmounted (/api/campaigns returns 404)", (
    campARes.status === 404
  ), { status: campARes.status });

  // User A attempts to add notes / update status on User B's Incident
  const idorIncUpdateRes = await fetch(`${API_BASE}/incidents/${userBIncidentId}`, {
    method: "PUT",
    headers: jsonHeadersA,
    body: JSON.stringify({ status: "Resolved", notes: "Malicious cross-tenant incident update" }),
  });
  const idorIncPlaybookRes = await fetch(`${API_BASE}/incidents/${userBIncidentId}/action`, {
    method: "POST",
    headers: jsonHeadersA,
    body: JSON.stringify({ actionName: "Block Attacker IP", details: "Unauthorized block attempt" }),
  });

  recordResult("16. IDOR Prevention: User A updating or executing actions on User B's Incident returns 403/404", (
    (idorIncUpdateRes.status === 403 || idorIncUpdateRes.status === 404) &&
    (idorIncPlaybookRes.status === 403 || idorIncPlaybookRes.status === 404)
  ), { updateStatus: idorIncUpdateRes.status, actionStatus: idorIncPlaybookRes.status });

  // --------------------------------------------------------------------------
  // 7. CASCADE DELETION TELEMETRY INTEGRITY AUDIT
  // --------------------------------------------------------------------------
  console.log("\n--- 7. AUDITING CASCADE DELETION ISOLATION ---");

  // User A deletes their SQLi log (logA3)
  const delA3Res = await fetch(`${API_BASE}/logs/${userALog3Id}`, {
    method: "DELETE",
    headers: headersA,
  });

  // Verify User A telemetry reduced
  const afterDelDashA = await (await fetch(`${API_BASE}/dashboard`, { headers: headersA })).json();

  // Verify User B telemetry remains 100% UNTOUCHED
  const afterDelDashB = await (await fetch(`${API_BASE}/dashboard`, { headers: headersB })).json();
  const survivingBLog1 = await Log.findById(userBLog1Id);
  const survivingBLog2 = await Log.findById(userBLog2Id);
  const survivingBThreat = await Threat.findById(userBThreat._id);
  const survivingBIncident = await Incident.findById(userBIncidentId);
  const survivingBReport = await Report.findById(userBReportId);

  const cascadeIsolationPass = (
    delA3Res.status === 200 &&
    afterDelDashA.stats.totalLogs === 2 &&
    (afterDelDashA.stats.threatsDetected === 1 || afterDelDashA.stats.totalThreats === 1) &&
    afterDelDashB.stats.totalLogs === 2 &&
    (afterDelDashB.stats.threatsDetected === 2 || afterDelDashB.stats.totalThreats === 2) &&
    survivingBLog1 !== null &&
    survivingBLog2 !== null &&
    survivingBThreat !== null &&
    survivingBIncident !== null &&
    survivingBReport !== null
  );

  recordResult("17. User A deleting their own log purges only User A telemetry; User B remains 100% intact", cascadeIsolationPass, {
    userATotalLogsAfter: afterDelDashA.stats?.totalLogs,
    userBTotalLogsAfter: afterDelDashB.stats?.totalLogs,
    userBThreatsAfter: afterDelDashB.stats?.totalThreats || afterDelDashB.stats?.threatsDetected,
  });

  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log("\n================================================================================");
  const passCount = testResults.filter((t) => t.passed).length;
  const failCount = testResults.filter((t) => !t.passed).length;
  console.log(`TWO-USER ISOLATION SUITE: ${passCount}/${testResults.length} TESTS PASSED (${failCount} FAILED)`);
  console.log("================================================================================\n");

  await mongoose.disconnect();
  process.exit(failCount === 0 ? 0 : 1);
};

runTwoUserIsolationSuite().catch((err) => {
  console.error("FATAL ERROR IN TWO-USER ISOLATION SUITE:", err);
  process.exit(1);
});
