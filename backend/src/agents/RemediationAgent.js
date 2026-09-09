/**
 * RemediationAgent.js
 * Specialized Agent 4: Contextual Remediation Guidance & Containment Playbook Formulation.
 *
 * Responsibilities:
 * - Evaluates detection results and intelligence context.
 * - Formulates prescriptive, actionable containment playbooks tailored to the observed threat vector.
 * - Generates clear investigation steps for SOC operators.
 * - Recommends safe, non-destructive mitigations by default.
 */

const REMEDIATION_PLAYBOOKS = {
  "Command Injection Attempt": {
    recommendation: "Disable shell execution primitives in runtime context, validate command arguments against strict whitelists, and isolate affected host container.",
    containmentType: "Host Quarantine & Runtime Hardening",
    playbookActions: [
      "Trigger Host Network Isolation on endpoint gateway",
      "Terminate suspicious active subshell / child processes (/bin/sh, cmd.exe)",
      "Audit system credential integrity (/etc/passwd, /etc/shadow)",
      "Deploy code hotfix replacing raw shell invocation with parameterized execution APIs",
    ],
    investigationSteps: [
      "Verify server process tree for anomalous parent-child relationships",
      "Inspect filesystem timestamps for recently created binary or script artifacts in /tmp",
      "Review outbound network socket connections to identify command-and-control beacons",
    ],
  },

  "SQL Injection Payload": {
    recommendation: "Enforce parameterized queries with prepared statements, apply WAF SQLi inspection rules, and audit database user permissions.",
    containmentType: "Edge WAF Parameter Filtering & DB Hardening",
    playbookActions: [
      "Apply Edge WAF IP Blacklist on offending source IP",
      "Enforce prepared statements across affected endpoint database queries",
      "Revoke high-privilege administrative grants from web application database user",
      "Inspect database audit logs for unauthorized schema modification or bulk data export",
    ],
    investigationSteps: [
      "Identify the exact API endpoint and parameter targeted in the request query",
      "Review database access logs around the incident timestamp for anomalous row counts",
      "Verify whether sensitive tables were dumped or modified",
    ],
  },

  "SSH Brute Force": {
    recommendation: "Enforce multi-factor authentication (MFA), configure fail2ban rate limiting, disable password-based SSH login, and block offending subnet at edge firewall.",
    containmentType: "Perimeter Firewall Block & MFA Enforcement",
    playbookActions: [
      "Apply Edge Firewall / WAF IP Blacklist on source subnet",
      "Disable password-based SSH access in /etc/ssh/sshd_config (enforce Ed25519 keys)",
      "Deploy Fail2ban daemon with aggressive ban triggers (maxretry = 3)",
      "Force immediate password reset and session invalidation for targeted accounts",
    ],
    investigationSteps: [
      "Check whether any of the authentication attempts succeeded during the burst",
      "Review auth.log for successful session opens immediately following failed attempts",
      "Audit active SSH sessions and authorized_keys file integrity",
    ],
  },

  "Reflected XSS Injection": {
    recommendation: "Implement context-aware HTML entity output encoding, configure Content Security Policy (CSP) headers, and sanitize user input parameters.",
    containmentType: "Web Application Content Sanitization",
    playbookActions: [
      "Deploy strict Content Security Policy (CSP) headers (default-src 'self')",
      "Apply context-aware HTML entity encoding on all reflected user input fields",
      "Audit DOM innerHTML assignments in client-side codebases",
    ],
    investigationSteps: [
      "Reproduce the injection in an isolated testing environment to determine execution viability",
      "Check if sensitive session cookies lacked the HttpOnly or SameSite=Strict flags",
      "Review client session logs for anomalous user-agent switches",
    ],
  },

  "Network Port Sweep": {
    recommendation: "Apply TCP SYN flood rate limiting, disable ICMP responses on perimeter routers, and review externally exposed network ports.",
    containmentType: "Network Perimeter Port Hardening",
    playbookActions: [
      "Configure TCP SYN rate-limiting on perimeter firewall interfaces",
      "Close or firewall unnecessary listening ports exposed to the public internet",
      "Add source IP to perimeter drop list if scanning persists",
    ],
    investigationSteps: [
      "Cross-reference scanned ports with actual running services on the host",
      "Verify whether the scanner attempted service-level exploitation following port discovery",
      "Review perimeter traffic volume for concurrent DDoS patterns",
    ],
  },

  "Clean Telemetry Baseline": {
    recommendation: "Continue regular log archiving and automated telemetry auditing.",
    containmentType: "Routine Telemetry Maintenance",
    playbookActions: [
      "Maintain continuous log forwarding to central ingestion portal",
      "Perform periodic security configuration audits",
    ],
    investigationSteps: [
      "No anomalous activity detected; retain logs per organizational retention policy",
    ],
  },
};

/**
 * Main Remediation Formulation Function
 * @param {object} detection - Output from ThreatClassifierAgent
 * @param {object} intelligence - Output from ThreatIntelligenceAgent
 * @returns {object} Actionable remediation payload
 */
const formulate = async (detection = {}, intelligence = {}) => {
  const threatType = detection.threatType || "Clean Telemetry Baseline";
  const playbook = REMEDIATION_PLAYBOOKS[threatType] || REMEDIATION_PLAYBOOKS["Clean Telemetry Baseline"];

  return {
    recommendation: playbook.recommendation,
    containmentType: playbook.containmentType,
    playbookActions: playbook.playbookActions,
    investigationSteps: playbook.investigationSteps,
    severityContext: detection.severity || "Low",
    sourceIpTarget: detection.sourceIp || null,
  };
};

module.exports = {
  formulate,
  REMEDIATION_PLAYBOOKS,
};
