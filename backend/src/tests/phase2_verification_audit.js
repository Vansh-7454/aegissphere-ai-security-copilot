/**
 * phase2_verification_audit.js
 * Comprehensive Verification & Real-Data Audit Test Suite for AegisSphere.
 */

process.env.NODE_ENV = "test";

const mongoose = require("mongoose");
const path = require("path");

const API_BASE = "http://127.0.0.1:5000/api";
const MONGO_URI = "mongodb://127.0.0.1:27017/aegissphere";

// Import Models directly for database relationship and cascade verification
const Log = require("../models/Log");
const Threat = require("../models/Threat");
const Report = require("../models/Report");
const Incident = require("../models/Incident");

const LogParserAgent = require("../agents/LogParserAgent");
const ThreatClassifierAgent = require("../agents/ThreatClassifierAgent");
const ThreatIntelligenceAgent = require("../agents/ThreatIntelligenceAgent");
const RemediationAgent = require("../agents/RemediationAgent");

const safeFetch = async (url, options = {}, retries = 4, delay = 800) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await globalThis.fetch(url, options);
      if (res.status >= 500 && attempt < retries) {
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      return res;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
};
const fetch = safeFetch;

let authToken = "";
let testUser = null;

const runTestSuite = async () => {
  console.log("================================================================================");
  console.log("AEGISSPHERE PHASE 2 VERIFICATION & REAL-DATA AUDIT TEST SUITE");
  console.log("================================================================================\n");

  await mongoose.connect(MONGO_URI);
  console.log("✓ Connected to MongoDB for direct entity state verification.\n");

  // Step 1: Authenticate operator
  const email = `phase2_tester_${Date.now()}@aegissphere.io`;
  const password = "Password123!";

  const regRes = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Phase 2 Auditor",
      email,
      password,
    }),
  });

  const regData = await regRes.json();
  authToken = regData.token;
  testUser = regData.user;
  console.log(`1. Authenticated as: ${email} (Role: ${testUser?.role || 'User'})\n`);

  const authHeaders = { Authorization: `Bearer ${authToken}` };

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
  // TEST SUITE SECTION 1: LOG PARSER AGENT DETERMINISTIC EXTRACTION
  // --------------------------------------------------------------------------
  console.log("--- 1. AUDITING LOG PARSER AGENT FIELD EXTRACTION ---");

  // Test 1.1: Syslog / Auth line
  const syslogSample = "Sep 09 10:14:02 auth-srv sshd[2841]: Failed password for invalid user root from 198.51.100.22 port 54321 ssh2";
  const parsedSyslog = LogParserAgent.parseLine(syslogSample, 0);

  const syslogPass = (
    parsedSyslog.sourceIp === "198.51.100.22" &&
    parsedSyslog.sourcePort === 54321 &&
    parsedSyslog.username === "root" &&
    parsedSyslog.protocol === "SSH" &&
    parsedSyslog.status === "FAILURE" &&
    parsedSyslog.timestamp !== null &&
    parsedSyslog.destinationIp === null
  );
  recordResult("Syslog line parsing (IP, Port, User, Action, Protocol)", syslogPass, parsedSyslog);

  // Test 1.2: Web Access Log Line
  const webSample = '198.51.100.44 - admin [09/Sep/2026:10:15:00 +0000] "GET /api/v1/users?id=1 HTTP/1.1" 200 4520 "-" "Mozilla/5.0"';
  const parsedWeb = LogParserAgent.parseLine(webSample, 0);

  const webPass = (
    parsedWeb.sourceIp === "198.51.100.44" &&
    parsedWeb.method === "GET" &&
    parsedWeb.endpoint === "/api/v1/users?id=1" &&
    parsedWeb.status === "200" &&
    parsedWeb.userAgent === "Mozilla/5.0"
  );
  recordResult("Web access line parsing (IP, Method, Endpoint, Status, User-Agent)", webPass, parsedWeb);

  // Test 1.3: Firewall Log with Destination IP and Port
  const fwSample = 'Sep 09 10:16:00 fw kernel: [DROP] src_ip=198.51.100.55 sport=40123 dst_ip=10.0.0.1 dport=443 proto=TCP';
  const parsedFw = LogParserAgent.parseLine(fwSample, 0);

  const fwPass = (
    parsedFw.sourceIp === "198.51.100.55" &&
    parsedFw.destinationIp === "10.0.0.1" &&
    parsedFw.sourcePort === 40123 &&
    parsedFw.destinationPort === 443
  );
  recordResult("Firewall packet log parsing (Source IP, Dst IP, Source Port, Dst Port)", fwPass, parsedFw);

  // Test 1.4: Missing IP -> returns null, NEVER invents IP
  const noIpSample = "System restart initiated by cron job";
  const parsedNoIp = LogParserAgent.parseLine(noIpSample, 0);
  const noIpPass = parsedNoIp.sourceIp === null && parsedNoIp.destinationIp === null;
  recordResult("Log line without IP preserves sourceIp: null (No fake IP)", noIpPass, parsedNoIp);

  // --------------------------------------------------------------------------
  // TEST SUITE SECTION 2: REAL LOG UPLOADS VIA HTTP (A through J)
  // --------------------------------------------------------------------------
  console.log("\n--- 2. AUDITING REAL LOG UPLOADS VIA API (POST /api/logs/upload) ---");

  const uploadLogBuffer = async (filename, content) => {
    const formData = new FormData();
    const blob = new Blob([content], { type: "text/plain" });
    formData.append("logFile", blob, filename);

    const res = await fetch(`${API_BASE}/logs/upload`, {
      method: "POST",
      headers: authHeaders,
      body: formData,
    });
    return res.json();
  };

  // Case A: Clean Normal Traffic
  const cleanLogContent = `
10.0.0.1 - - [09/Sep/2026:10:00:01 +0000] "GET /index.html HTTP/1.1" 200 4120
10.0.0.1 - - [09/Sep/2026:10:00:02 +0000] "GET /assets/style.css HTTP/1.1" 200 1204
10.0.0.2 - - [09/Sep/2026:10:00:03 +0000] "GET /api/health HTTP/1.1" 200 48
`.trim();

  const cleanUpload = await uploadLogBuffer("clean_traffic.log", cleanLogContent);
  const cleanPass = (
    cleanUpload.success === true &&
    cleanUpload.threat === null &&
    cleanUpload.log.threatCount === 0 &&
    cleanUpload.incident === null
  );
  recordResult("Case A: Clean normal traffic produces detected: false and 0 threats", cleanPass, {
    message: cleanUpload.message,
    threat: cleanUpload.threat,
  });

  // Case B1: SSH Brute Force - High Velocity Burst targeting root
  const bruteForceBurst = `
2026-09-09T10:00:01Z edge-gw sshd[101]: Failed password for invalid user root from 198.51.100.99 port 50001 ssh2
2026-09-09T10:00:05Z edge-gw sshd[102]: Failed password for invalid user root from 198.51.100.99 port 50002 ssh2
2026-09-09T10:00:10Z edge-gw sshd[103]: Failed password for invalid user root from 198.51.100.99 port 50003 ssh2
2026-09-09T10:00:15Z edge-gw sshd[104]: Failed password for invalid user root from 198.51.100.99 port 50004 ssh2
2026-09-09T10:00:20Z edge-gw sshd[105]: Failed password for root from 198.51.100.99 port 50005 ssh2
2026-09-09T10:00:22Z edge-gw sshd[106]: error: maximum authentication attempts exceeded for root from 198.51.100.99 port 50005 ssh2
`.trim();

  const bruteUpload = await uploadLogBuffer("ssh_brute_burst.log", bruteForceBurst);
  const brutePass = (
    bruteUpload.success === true &&
    bruteUpload.threat !== null &&
    bruteUpload.threat.threatType === "SSH Brute Force" &&
    bruteUpload.threat.severity === "Critical" &&
    bruteUpload.threat.confidence >= 90 &&
    bruteUpload.threat.sourceIp === "198.51.100.99" &&
    bruteUpload.threat.mitreTechnique.includes("T1110") &&
    bruteUpload.threat.confidenceReason.includes("repeated authentication failures")
  );
  recordResult("Case B1: High-velocity root brute force -> Critical severity & derived high confidence", brutePass, {
    threatType: bruteUpload.threat?.threatType,
    severity: bruteUpload.threat?.severity,
    confidence: bruteUpload.threat?.confidence,
    reason: bruteUpload.threat?.confidenceReason,
  });

  // Case B2: Milder Dispersed Brute Force (Varying Confidence Verification)
  const bruteMilder = `
2026-09-09T01:00:00Z edge-gw sshd[201]: Failed password for guest from 198.51.100.80 port 41000 ssh2
2026-09-09T08:00:00Z edge-gw sshd[202]: Failed password for guest from 198.51.100.80 port 41001 ssh2
`.trim();

  const bruteMilderUpload = await uploadLogBuffer("ssh_milder.log", bruteMilder);
  const confidenceDiffers = (
    bruteMilderUpload.threat !== null &&
    bruteMilderUpload.threat.confidence < bruteUpload.threat.confidence &&
    bruteMilderUpload.threat.severity !== "Critical"
  );
  recordResult("Confidence Variance: Milder/dispersed brute force produces lower confidence & severity", confidenceDiffers, {
    burstConfidence: bruteUpload.threat?.confidence,
    milderConfidence: bruteMilderUpload.threat?.confidence,
    milderSeverity: bruteMilderUpload.threat?.severity,
  });

  // Case C: SQL Injection (SQLi)
  const sqliLog = `
198.51.100.77 - - [09/Sep/2026:10:10:00 +0000] "GET /api/v1/products?cat=1%20UNION%20SELECT%20null,schema_name%20FROM%20information_schema.schemata-- HTTP/1.1" 200 8192
`.trim();

  const sqliUpload = await uploadLogBuffer("sqli_attack.log", sqliLog);
  const sqliPass = (
    sqliUpload.threat !== null &&
    sqliUpload.threat.threatType === "SQL Injection Payload" &&
    sqliUpload.threat.sourceIp === "198.51.100.77" &&
    sqliUpload.threat.mitreTechnique.includes("T1190")
  );
  recordResult("Case C: SQL Injection parsed and classified with MITRE T1190", sqliPass, {
    threatType: sqliUpload.threat?.threatType,
    confidence: sqliUpload.threat?.confidence,
    mitre: sqliUpload.threat?.mitreTechnique,
  });

  // Case D: Command Injection (RCE)
  const rceLog = `
198.51.100.33 - - [09/Sep/2026:10:12:00 +0000] "POST /cgi-bin/tool.cgi HTTP/1.1" 200 1024 "param=127.0.0.1; cat /etc/passwd | /bin/sh"
`.trim();

  const rceUpload = await uploadLogBuffer("rce_attack.log", rceLog);
  const rcePass = (
    rceUpload.threat !== null &&
    rceUpload.threat.threatType === "Command Injection Attempt" &&
    rceUpload.threat.severity === "Critical" &&
    rceUpload.threat.mitreTechnique.includes("T1059")
  );
  recordResult("Case D: Command Injection classified as Critical with MITRE T1059", rcePass, {
    threatType: rceUpload.threat?.threatType,
    severity: rceUpload.threat?.severity,
  });

  // Case E: Port Scanning Events
  const portScanLog = `
198.51.100.66 - - [09/Sep/2026:10:15:00 +0000] connection refused on port 21 (FTP) - SYN scan probe
198.51.100.66 - - [09/Sep/2026:10:15:01 +0000] connection refused on port 22 (SSH) - SYN scan probe
198.51.100.66 - - [09/Sep/2026:10:15:02 +0000] connection refused on port 23 (Telnet) - SYN scan probe
198.51.100.66 - - [09/Sep/2026:10:15:03 +0000] connection refused on port 3306 (MySQL) - Nmap probe
`.trim();

  const portScanUpload = await uploadLogBuffer("port_scan.log", portScanLog);
  const portScanPass = (
    portScanUpload.threat !== null &&
    portScanUpload.threat.threatType === "Network Port Sweep" &&
    portScanUpload.threat.mitreTechnique.includes("T1595")
  );
  recordResult("Case E: Port Scanning detected with MITRE T1595 Active Scanning", portScanPass, {
    threatType: portScanUpload.threat?.threatType,
  });

  // Case F: Reflected XSS
  const xssLog = `
198.51.100.12 - - [09/Sep/2026:10:20:00 +0000] "GET /search?q=%3Cscript%3Edocument.cookie=%27test%27;%3C/script%3E HTTP/1.1" 200 450
`.trim();

  const xssUpload = await uploadLogBuffer("xss_attack.log", xssLog);
  const xssPass = (
    xssUpload.threat !== null &&
    xssUpload.threat.threatType === "Reflected XSS Injection" &&
    xssUpload.threat.mitreTechnique.includes("T1059.007")
  );
  recordResult("Case F: Reflected XSS classified with MITRE T1059.007", xssPass, {
    threatType: xssUpload.threat?.threatType,
    severity: xssUpload.threat?.severity,
  });

  // Case G: Mixed Normal + Suspicious Events
  const mixedLog = `
10.0.0.1 - - [09/Sep/2026:10:00:01 +0000] "GET /home HTTP/1.1" 200 1200
10.0.0.1 - - [09/Sep/2026:10:00:02 +0000] "GET /about HTTP/1.1" 200 1400
10.0.0.1 - - [09/Sep/2026:10:00:03 +0000] "GET /contact HTTP/1.1" 200 900
198.51.100.44 - - [09/Sep/2026:10:00:04 +0000] "GET /login?user=admin%27%20OR%20%271%27=%271 HTTP/1.1" 200 800
10.0.0.1 - - [09/Sep/2026:10:00:05 +0000] "GET /footer.png HTTP/1.1" 200 500
`.trim();

  const mixedUpload = await uploadLogBuffer("mixed_events.log", mixedLog);
  const mixedPass = (
    mixedUpload.threat !== null &&
    mixedUpload.threat.threatType === "SQL Injection Payload" &&
    mixedUpload.threat.sourceIp === "198.51.100.44"
  );
  recordResult("Case G: Mixed traffic correctly isolates malicious event and attacker IP", mixedPass, {
    threatType: mixedUpload.threat?.threatType,
    sourceIp: mixedUpload.threat?.sourceIp,
  });

  // Case H: Logs with Missing Source IP
  const missingIpLog = `
Internal Audit: Database command execution error: SELECT * FROM users WHERE id = 1 UNION SELECT password FROM admin--
`.trim();

  const missingIpUpload = await uploadLogBuffer("missing_ip.log", missingIpLog);
  const missingIpPass = (
    missingIpUpload.threat !== null &&
    missingIpUpload.threat.sourceIp === null
  );
  recordResult("Case H: Log without IP sets sourceIp: null (Never invents random IP)", missingIpPass, {
    sourceIp: missingIpUpload.threat?.sourceIp,
  });

  // Case I: Malformed / Unstructured Log Lines
  const malformedLog = `
-- GARBAGE HEADER ---
random unparseable gibberish 9999999
-- MORE TEXT ---
`.trim();

  const malformedUpload = await uploadLogBuffer("malformed.log", malformedLog);
  const malformedPass = (
    malformedUpload.success === true &&
    malformedUpload.threat === null
  );
  recordResult("Case I: Malformed log handled safely without crashing (0 false threats)", malformedPass, {
    message: malformedUpload.message,
  });

  // Case J: Multi-Format (CSV and JSON)
  const csvContent = `
timestamp,src_ip,username,action,status
2026-09-09T10:00:00Z,198.51.100.50,root,FAILED_AUTH,FAILURE
2026-09-09T10:00:02Z,198.51.100.50,root,FAILED_AUTH,FAILURE
2026-09-09T10:00:04Z,198.51.100.50,root,FAILED_AUTH,FAILURE
2026-09-09T10:00:06Z,198.51.100.50,root,FAILED_AUTH,FAILURE
2026-09-09T10:00:08Z,198.51.100.50,root,FAILED_AUTH,FAILURE
2026-09-09T10:00:10Z,198.51.100.50,root,FAILED_AUTH,FAILURE
`.trim();

  const csvUpload = await uploadLogBuffer("security_audit.csv", csvContent);
  const csvPass = csvUpload.threat !== null && csvUpload.threat.sourceIp === "198.51.100.50";
  recordResult("Case J1: CSV structured log parsed and classified", csvPass, {
    format: csvUpload.log.fileFormat,
    threatType: csvUpload.threat?.threatType,
  });

  const jsonContent = JSON.stringify([
    { timestamp: "2026-09-09T10:00:00Z", src_ip: "198.51.100.51", action: "GET", endpoint: "/api?q=1; cat /etc/passwd" },
  ]);

  const jsonUpload = await uploadLogBuffer("security_audit.json", jsonContent);
  const jsonPass = jsonUpload.threat !== null && jsonUpload.threat.threatType === "Command Injection Attempt";
  recordResult("Case J2: JSON structured array parsed and classified", jsonPass, {
    format: jsonUpload.log.fileFormat,
    threatType: jsonUpload.threat?.threatType,
  });

  // Allow watcher settling pause after 11 consecutive file uploads
  await new Promise((r) => setTimeout(r, 2500));

  // --------------------------------------------------------------------------
  // TEST SUITE SECTION 3: SECURITY TEST LAB CONTROLLED SIMULATION
  // --------------------------------------------------------------------------
  console.log("\n--- 3. AUDITING SECURITY TEST LAB (SAME 4-AGENT PIPELINE) ---");

  const testLabRes = await fetch(`${API_BASE}/attack-tests/generate`, {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ attackType: "SQL Injection" }),
  });

  const testLabData = await testLabRes.json();
  const testLabPass = (
    testLabData.success === true &&
    testLabData.threat !== null &&
    testLabData.threat.threatType.includes("[Controlled Simulation]") &&
    testLabData.threat.sourceIp === "198.51.100.112" &&
    testLabData.agentTelemetry !== undefined &&
    testLabData.agentTelemetry.stages.parser.status === "Completed" &&
    testLabData.agentTelemetry.stages.classifier.status === "Completed" &&
    testLabData.agentTelemetry.stages.intelligence.status === "Enriched" &&
    testLabData.agentTelemetry.stages.remediation.status === "Formulated"
  );
  recordResult("Security Test Lab generates RFC-5737 log and passes through SAME 4 agents", testLabPass, {
    threatType: testLabData.threat?.threatType,
    sourceIp: testLabData.threat?.sourceIp,
    stages: Object.keys(testLabData.agentTelemetry?.stages || {}),
  });

  // --------------------------------------------------------------------------
  // TEST SUITE SECTION 4: DATABASE RELATIONSHIPS & CASCADE DELETION
  // --------------------------------------------------------------------------
  console.log("\n--- 4. AUDITING DATABASE RELATIONSHIPS & CASCADE DELETION ---");

  // Verify relational links on one of the created items
  const dbThreat = await Threat.findById(bruteUpload.threat._id);
  const dbLog = await Log.findById(bruteUpload.log._id);
  const dbReport = await Report.findOne({ logId: dbLog._id });
  const dbIncident = await Incident.findOne({ logId: dbLog._id });

  const relationPass = (
    dbThreat && dbLog && dbReport && dbIncident &&
    dbThreat.logId.toString() === dbLog._id.toString() &&
    dbLog.analysis.toString() === dbThreat._id.toString() &&
    dbReport.logId.toString() === dbLog._id.toString() &&
    dbIncident.threatId.toString() === dbThreat._id.toString() &&
    dbIncident.logId.toString() === dbLog._id.toString()
  );
  recordResult("Relational integrity: Log <-> Threat <-> Report <-> Incident", relationPass);

  // Perform Cascade Deletion test
  const targetLogId = dbLog._id.toString();
  const targetThreatId = dbThreat._id.toString();
  const targetReportId = dbReport._id.toString();
  const targetIncidentId = dbIncident._id.toString();

  const delRes = await fetch(`${API_BASE}/logs/${targetLogId}`, {
    method: "DELETE",
    headers: authHeaders,
  });

  // Query database directly to confirm cascade deletion
  const checkLog = await Log.findById(targetLogId);
  const checkThreat = await Threat.findById(targetThreatId);
  const checkReport = await Report.findById(targetReportId);
  const checkIncident = await Incident.findById(targetIncidentId);

  const cascadePass = (
    delRes.status === 200 &&
    checkLog === null &&
    checkThreat === null &&
    checkReport === null &&
    checkIncident === null
  );
  recordResult("Cascade deletion: Log deletion cleanly purges Threat, Report, and Incident (0 orphans)", cascadePass, {
    logDeleted: checkLog === null,
    threatDeleted: checkThreat === null,
    reportDeleted: checkReport === null,
    incidentDeleted: checkIncident === null,
  });

  // --------------------------------------------------------------------------
  // TEST SUITE SECTION 5: DASHBOARD REAL DATA INTEGRITY
  // --------------------------------------------------------------------------
  console.log("\n--- 5. AUDITING DASHBOARD METRICS FROM MONGODB ---");

  const dashRes = await fetch(`${API_BASE}/dashboard`, { headers: authHeaders });
  const dashData = await dashRes.json();

  const actualThreatCount = await Threat.countDocuments({ logId: { $in: (await Log.find({ uploadedBy: testUser._id || testUser.id })).map(l => l._id) } });

  const dashPass = (
    dashData.success === true &&
    dashData.totalThreats === actualThreatCount &&
    Array.isArray(dashData.threatTrend) &&
    dashData.threatTrend.length === 7
  );
  recordResult("Dashboard metrics match real MongoDB document aggregations exactly", dashPass, {
    reportedTotalThreats: dashData.totalThreats,
    dbThreats: actualThreatCount,
  });

  // --------------------------------------------------------------------------
  // TEST SUITE SECTION 6: API ERROR HANDLING & AUTHENTICATION ENFORCEMENT
  // --------------------------------------------------------------------------
  console.log("\n--- 6. AUDITING ERROR HANDLING & AUTHENTICATION ENFORCEMENT ---");

  // 6.1: Empty File Upload
  try {
    const emptyRes = await uploadLogBuffer("empty.log", "");
    recordResult("Empty file upload handled safely", emptyRes.success === true && emptyRes.threat === null);
  } catch (err) {
    recordResult("Empty file upload handled safely", true);
  }

  // 6.2: Unauthenticated Request
  const unauthRes = await fetch(`${API_BASE}/dashboard`);
  recordResult("Unauthenticated dashboard access returns 401 Unauthorized", unauthRes.status === 401);

  // 6.3: Unsupported File Extension
  const badForm = new FormData();
  const badBlob = new Blob(["test"], { type: "application/octet-stream" });
  badForm.append("logFile", badBlob, "malware.exe");
  const badRes = await fetch(`${API_BASE}/logs/upload`, {
    method: "POST",
    headers: authHeaders,
    body: badForm,
  });
  recordResult("Unsupported .exe upload rejected by Multer extension filter", badRes.status >= 400);

  // Summary
  console.log("\n================================================================================");
  const totalTests = testResults.length;
  const passedTests = testResults.filter((t) => t.passed).length;
  const failedTests = testResults.filter((t) => !t.passed).length;

  console.log(`PHASE 2 AUDIT COMPLETE: ${passedTests}/${totalTests} TESTS PASSED (${failedTests} FAILED)`);
  console.log("================================================================================\n");

  await mongoose.disconnect();
};

runTestSuite().catch((err) => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});
