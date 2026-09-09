/**
 * ThreatIntelligenceAgent.js
 * Specialized Agent 3: Threat Intelligence Contextual Enrichment & MITRE ATT&CK Mapping.
 *
 * Responsibilities:
 * - Enriches detected threats with tactical context and MITRE ATT&CK enterprise techniques.
 * - Links verified attack patterns to standard tactic IDs and mitigation frameworks.
 * - Maintains a resilient in-memory intelligence cache for high-throughput lookups.
 * - Fails safely if external intelligence feeds are offline without interrupting the core detection pipeline.
 */

// Curated MITRE ATT&CK Enterprise Matrix Definitions (v14.1)
const MITRE_DEFINITIONS = {
  "Command Injection Attempt": {
    techniqueId: "T1059",
    techniqueName: "Command and Scripting Interpreter",
    mitreTactic: "Execution",
    tacticId: "TA0002",
    summary: "Adversaries execute arbitrary commands and scripts via command-line interpreters (bash, sh, cmd, powershell) to interact with the underlying host operating system.",
    references: ["https://attack.mitre.org/techniques/T1059/"],
  },
  "SQL Injection Payload": {
    techniqueId: "T1190",
    techniqueName: "Exploit Public-Facing Application (SQLi)",
    mitreTactic: "Initial Access",
    tacticId: "TA0001",
    summary: "Adversaries manipulate application input parameters with SQL query tokens to extract database records, bypass authentication mechanisms, or execute administrative commands.",
    references: ["https://attack.mitre.org/techniques/T1190/"],
  },
  "SSH Brute Force": {
    techniqueId: "T1110",
    techniqueName: "Brute Force (Password Spraying)",
    mitreTactic: "Credential Access / Initial Access",
    tacticId: "TA0001",
    summary: "Adversaries systematically submit repeated password combinations against exposed authentication endpoints to gain unauthorized access to target system credentials.",
    references: ["https://attack.mitre.org/techniques/T1110/"],
  },
  "Reflected XSS Injection": {
    techniqueId: "T1059.007",
    techniqueName: "JavaScript Cross-Site Scripting",
    mitreTactic: "Execution",
    tacticId: "TA0002",
    summary: "Adversaries inject malicious client-side JavaScript payloads into web application requests to hijack session tokens, steal sensitive cookies, or redirect victims.",
    references: ["https://attack.mitre.org/techniques/T1059/007/"],
  },
  "Network Port Sweep": {
    techniqueId: "T1595",
    techniqueName: "Active Scanning (Port Probe)",
    mitreTactic: "Reconnaissance",
    tacticId: "TA0043",
    summary: "Adversaries actively probe listening ports and network services across IP address spaces to discover vulnerable entry points prior to exploitation.",
    references: ["https://attack.mitre.org/techniques/T1595/"],
  },
  "Clean Telemetry Baseline": {
    techniqueId: "T1005",
    techniqueName: "Data from Local System",
    mitreTactic: "Collection",
    tacticId: "TA0009",
    summary: "Standard routine system telemetry and event monitoring.",
    references: ["https://attack.mitre.org/techniques/T1005/"],
  },
};

// In-memory cache to prevent redundant lookups
const intelligenceCache = new Map();

/**
 * Main Threat Intelligence Enrichment Function
 * @param {object} detection - Detection contract from ThreatClassifierAgent
 * @returns {object} Threat intelligence enrichment payload
 */
const enrich = async (detection = {}) => {
  const threatType = detection.threatType || "Clean Telemetry Baseline";

  // Check in-memory cache first
  if (intelligenceCache.has(threatType)) {
    return intelligenceCache.get(threatType);
  }

  // Lookup in verified MITRE ATT&CK dataset
  const mitreInfo = MITRE_DEFINITIONS[threatType] || {
    techniqueId: "T1059",
    techniqueName: "General Security Anomaly",
    mitreTactic: "Initial Access",
    tacticId: "TA0001",
    summary: "Unclassified security event signature requiring operator review.",
    references: ["https://attack.mitre.org/"],
  };

  const enrichmentResult = {
    techniqueId: mitreInfo.techniqueId,
    techniqueName: mitreInfo.techniqueName,
    mitreTechnique: `${mitreInfo.techniqueId} - ${mitreInfo.techniqueName}`,
    mitreTactic: mitreInfo.mitreTactic,
    tacticId: mitreInfo.tacticId,
    attackPatternSummary: mitreInfo.summary,
    intelligenceAvailable: true,
    intelligenceSource: "MITRE ATT&CK Enterprise Matrix v14.1 (Curated)",
    references: mitreInfo.references,
    ipReputation: detection.sourceIp ? {
      ip: detection.sourceIp,
      status: "Evaluated in local pipeline",
      feedAvailable: false,
      feedNotice: "External IP reputation feed unconfigured; source IP extracted from log telemetry.",
    } : null,
  };

  // Cache result
  intelligenceCache.set(threatType, enrichmentResult);

  return enrichmentResult;
};

module.exports = {
  enrich,
  MITRE_DEFINITIONS,
};
