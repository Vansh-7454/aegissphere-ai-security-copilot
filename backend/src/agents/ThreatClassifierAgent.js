/**
 * ThreatClassifierAgent.js
 * Specialized Agent 2: Pattern Recognition, Heuristic Rule Matching, and Multi-Event Correlation.
 *
 * Responsibilities:
 * - Analyzes structured events from LogParserAgent.
 * - Performs event clustering, source IP aggregation, and frequency/time-window analysis.
 * - Executes rule-based classification across major attack categories:
 *   1. Command & Shell Injection (RCE)
 *   2. SQL Injection (SQLi)
 *   3. Authentication & SSH Brute Force
 *   4. Cross-Site Scripting (XSS)
 *   5. Network Reconnaissance & Port Sweeping
 * - Computes transparent, evidence-driven confidence scores and explainable confidence reasons.
 * - Derives severity dynamically based on impact, frequency, and privileged target involvement.
 * - Returns a clean detection contract (or detected: false for baseline clean telemetry).
 */

// Helper to normalize and safely URL-decode log payloads for accurate detection
const normalizeText = (str) => {
  if (!str) return '';
  let s = String(str);
  try {
    s = decodeURIComponent(s);
  } catch (e) {
    s = s.replace(/%20/g, ' ').replace(/%27/g, "'").replace(/%22/g, '"').replace(/%3c/gi, '<').replace(/%3e/gi, '>');
  }
  return s.toLowerCase();
};

/**
 * Main Classification Function
 * @param {Array} events - Array of parsed event objects from LogParserAgent
 * @param {object} stats - Aggregated statistics from LogParserAgent
 * @returns {object} Standardized detection contract
 */
const classify = async (events = [], stats = {}) => {
  if (!events || events.length === 0) {
    return {
      detected: false,
      threatType: "Clean Telemetry Baseline",
      severity: "Low",
      confidence: 0,
      confidenceReason: "No security log events present to evaluate.",
      confidenceFactors: [],
      evidence: [],
      indicators: [],
      sourceIp: null,
      affectedResource: null,
      description: "Empty log stream parsed with no anomalous telemetry.",
      eventCount: 0,
      ruleMatched: "NONE",
    };
  }

  // Combine full text payload and normalized version for signature matching
  const rawCombined = events.map((e) => `${e.message || ''} ${e.rawMessage || ''} ${e.endpoint || ''} ${e.action || ''}`).join('\n');
  const lowerText = `${rawCombined.toLowerCase()}\n${normalizeText(rawCombined)}`;
  const primarySourceIp = stats.primarySourceIp || null;

  // Correlation maps
  const ipGroup = {};
  const userGroup = {};
  let authFailCount = 0;
  const authFailEvents = [];

  events.forEach((ev) => {
    const msg = (ev.message || '').toLowerCase();

    // Track IP frequency
    if (ev.sourceIp) {
      ipGroup[ev.sourceIp] = (ipGroup[ev.sourceIp] || 0) + 1;
    }

    // Track User targeting
    if (ev.username) {
      userGroup[ev.username] = (userGroup[ev.username] || 0) + 1;
    }

    // Track Auth failures
    if (
      msg.includes("failed password") ||
      msg.includes("failed login") ||
      msg.includes("authentication failure") ||
      msg.includes("auth failure") ||
      msg.includes("invalid user") ||
      msg.includes("login failed") ||
      msg.includes("bad password") ||
      ev.action === "FAILED_AUTH" ||
      ev.status === "FAILURE"
    ) {
      authFailCount++;
      authFailEvents.push(ev);
    }
  });

  // Most active IP in event stream
  let topIp = primarySourceIp;
  let maxIpCount = 0;
  Object.entries(ipGroup).forEach(([ip, count]) => {
    if (count > maxIpCount) {
      maxIpCount = count;
      topIp = ip;
    }
  });

  // =========================================================================
  // 1. COMMAND & SHELL INJECTION (RCE) EVALUATION
  // =========================================================================
  const cmdEvidence = [];
  const cmdFactors = [];

  const matchingCmdEvent = events.find((e) => {
    const m = `${(e.message || '').toLowerCase()} ${normalizeText(e.message || e.rawMessage || '')}`;
    return (
      m.includes("/bin/sh") || m.includes("/bin/bash") ||
      m.includes("cmd.exe") || m.includes("powershell") ||
      m.includes("cat /etc/passwd") || m.includes("cat /etc/shadow") ||
      m.includes("wget http") || m.includes("curl http") ||
      m.includes("chmod +x") || m.includes("chmod 777") ||
      m.includes("; id") || m.includes("| id") || m.includes("&& whoami")
    );
  });
  const cmdIp = matchingCmdEvent && matchingCmdEvent.sourceIp ? matchingCmdEvent.sourceIp : topIp;

  if (lowerText.includes("/bin/sh") || lowerText.includes("/bin/bash")) {
    cmdEvidence.push("Direct POSIX shell binary execution (/bin/sh, /bin/bash)");
    cmdFactors.push("Shell binary pattern (+25%)");
  }
  if (lowerText.includes("cmd.exe") || lowerText.includes("powershell")) {
    cmdEvidence.push("Windows command interpreter invocation (cmd.exe / powershell)");
    cmdFactors.push("Windows command interpreter (+20%)");
  }
  if (lowerText.includes("cat /etc/passwd") || lowerText.includes("cat /etc/shadow")) {
    cmdEvidence.push("Unauthorized credential file read attempt (cat /etc/passwd)");
    cmdFactors.push("System credential file access (+30%)");
  }
  if (lowerText.includes("wget http") || lowerText.includes("curl http") || lowerText.includes("curl -o") || lowerText.includes("wget -q")) {
    cmdEvidence.push("External malicious payload retrieval cradle (wget/curl)");
    cmdFactors.push("Outbound payload download cradle (+20%)");
  }
  if (lowerText.includes("chmod +x") || lowerText.includes("chmod 777")) {
    cmdEvidence.push("Executable privilege elevation attempt (chmod +x / 777)");
    cmdFactors.push("Permission alteration (+15%)");
  }
  if (lowerText.includes("; id") || lowerText.includes("| id") || lowerText.includes("&& whoami") || lowerText.includes("`whoami`") || lowerText.includes("$(whoami)")) {
    cmdEvidence.push("Arbitrary command chaining metacharacters (; / | / && / whoami)");
    cmdFactors.push("Shell chaining metacharacters (+20%)");
  }

  if (cmdEvidence.length > 0) {
    const baseScore = 60 + cmdEvidence.length * 10;
    const confidence = Math.min(98, Math.round(baseScore));
    const isCritical = cmdEvidence.length >= 2 || lowerText.includes("/etc/passwd") || lowerText.includes("/bin/sh");
    const severity = isCritical ? "Critical" : "High";

    return {
      detected: true,
      threatType: "Command Injection Attempt",
      severity,
      confidence,
      confidenceReason: `Confidence score (${confidence}%) derived from ${cmdEvidence.length} matched RCE signature(s): ${cmdEvidence.join('; ')}.`,
      confidenceFactors: cmdFactors,
      evidence: cmdEvidence,
      indicators: cmdEvidence,
      sourceIp: cmdIp,
      affectedResource: "Server Shell & Runtime Environment",
      description: `Arbitrary system command execution strings intercepted in security telemetry stream${cmdIp ? ` originating from ${cmdIp}` : ''}.`,
      eventCount: events.length,
      ruleMatched: "RULE-RCE-001",
    };
  }

  // =========================================================================
  // 2. SQL INJECTION (SQLi) EVALUATION
  // =========================================================================
  const sqliEvidence = [];
  const sqliFactors = [];

  const matchingSqliEvent = events.find((e) => {
    const m = `${(e.message || '').toLowerCase()} ${normalizeText(e.message || e.rawMessage || '')}`;
    return (
      m.includes("union select") || m.includes("union all select") ||
      m.includes("or 1=1") || m.includes("' or '1'='1") || m.includes('" or "1"="1') || m.includes("' or true--") || m.includes("or 1=1--") ||
      m.includes("information_schema") || m.includes("sys.tables") || m.includes("all_tables") ||
      m.includes("drop table") || m.includes("truncate table") || m.includes("delete from") ||
      m.includes("xp_cmdshell") || m.includes("into outfile") || m.includes("into dumpfile") ||
      m.includes("sleep(") || m.includes("benchmark(") || m.includes("waitfor delay") ||
      (m.includes("select ") && m.includes(" from "))
    );
  });
  const sqliIp = matchingSqliEvent && matchingSqliEvent.sourceIp ? matchingSqliEvent.sourceIp : topIp;

  const primarySqli = matchingSqliEvent !== undefined;

  if (primarySqli) {
    if (lowerText.includes("union select") || lowerText.includes("union all select")) {
      sqliEvidence.push("UNION query data exfiltration payload");
      sqliFactors.push("UNION operator pattern (+30%)");
    }
    if (lowerText.includes("or 1=1") || lowerText.includes("' or '1'='1") || lowerText.includes('" or "1"="1') || lowerText.includes("' or true--") || lowerText.includes("or 1=1--")) {
      sqliEvidence.push("Tautology boolean-based authentication bypass (' OR '1'='1)");
      sqliFactors.push("Boolean bypass pattern (+25%)");
    }
    if (lowerText.includes("information_schema") || lowerText.includes("sys.tables") || lowerText.includes("all_tables")) {
      sqliEvidence.push("Database schema metadata enumeration (information_schema)");
      sqliFactors.push("Schema metadata query (+20%)");
    }
    if (lowerText.includes("drop table") || lowerText.includes("truncate table") || lowerText.includes("delete from")) {
      sqliEvidence.push("Destructive database query payload (DROP/TRUNCATE/DELETE)");
      sqliFactors.push("Destructive DDL/DML token (+35%)");
    }
    if (lowerText.includes("xp_cmdshell") || lowerText.includes("into outfile") || lowerText.includes("into dumpfile")) {
      sqliEvidence.push("Database file dump / OS command execution (xp_cmdshell / INTO OUTFILE)");
      sqliFactors.push("High-risk execution primitive (+35%)");
    }
    if (lowerText.includes("sleep(") || lowerText.includes("benchmark(") || lowerText.includes("waitfor delay")) {
      sqliEvidence.push("Time-based blind SQL injection primitives (SLEEP / BENCHMARK)");
      sqliFactors.push("Time-delay blind injection (+20%)");
    }
    if (lowerText.includes("--") || lowerText.includes("/*") || lowerText.includes("%27") || lowerText.includes("%22")) {
      sqliEvidence.push("SQL inline comment termination / URL encoded evasion tokens");
      sqliFactors.push("Comment termination / escape token (+15%)");
    }
  }

  if (sqliEvidence.length > 0) {
    const baseScore = 55 + sqliEvidence.length * 9;
    const confidence = Math.min(97, Math.round(baseScore));
    const isCritical = sqliEvidence.some((e) => e.includes("Destructive") || e.includes("High-risk") || e.includes("UNION"));
    const severity = isCritical ? "Critical" : "High";

    return {
      detected: true,
      threatType: "SQL Injection Payload",
      severity,
      confidence,
      confidenceReason: `Confidence score (${confidence}%) derived from ${sqliEvidence.length} verified SQLi indicator(s): ${sqliEvidence.join('; ')}.`,
      confidenceFactors: sqliFactors,
      evidence: sqliEvidence,
      indicators: sqliEvidence,
      sourceIp: sqliIp,
      affectedResource: "Database & Public Web Application Layer",
      description: `Suspected SQL syntax manipulation queries detected in request parameters${sqliIp ? ` originating from ${sqliIp}` : ''}.`,
      eventCount: events.length,
      ruleMatched: "RULE-SQLI-001",
    };
  }

  // =========================================================================
  // 3. AUTHENTICATION & SSH BRUTE FORCE EVALUATION
  // =========================================================================
  const authEvidence = [];
  const authFactors = [];

  // Group failures by IP to isolate the specific brute-force source
  let authTopIp = null;
  let maxAuthFailures = 0;
  const authIpCounts = {};
  authFailEvents.forEach((e) => {
    if (e.sourceIp) {
      authIpCounts[e.sourceIp] = (authIpCounts[e.sourceIp] || 0) + 1;
      if (authIpCounts[e.sourceIp] > maxAuthFailures) {
        maxAuthFailures = authIpCounts[e.sourceIp];
        authTopIp = e.sourceIp;
      }
    }
  });
  const authIp = authTopIp || topIp;

  if (authFailCount >= 2 || lowerText.includes("hydra") || lowerText.includes("maximum authentication attempts exceeded")) {
    authEvidence.push(`${authFailCount} sequential authentication failure event(s) recorded`);
    authFactors.push(`Repeated failed auth count (${authFailCount}) (+${Math.min(authFailCount * 5, 25)}%)`);

    // Time-window correlation analysis
    const validTimestamps = authFailEvents
      .map((e) => e.timestamp ? new Date(e.timestamp).getTime() : null)
      .filter((t) => t !== null && !isNaN(t));

    let isRapidBurst = false;
    if (validTimestamps.length >= 2) {
      const minTs = Math.min(...validTimestamps);
      const maxTs = Math.max(...validTimestamps);
      const spanSeconds = Math.round((maxTs - minTs) / 1000);

      if (spanSeconds <= 300) {
        isRapidBurst = true;
        authEvidence.push(`Rapid authentication failure velocity: ${authFailCount} failures within ${spanSeconds}s window`);
        authFactors.push(`Concentrated time window (${spanSeconds}s) (+12%)`);
      } else {
        authEvidence.push(`Authentication failures dispersed across ${Math.round(spanSeconds / 60)} minute(s)`);
        authFactors.push(`Dispersed time window (${Math.round(spanSeconds / 60)}m) (+4%)`);
      }
    }

    const targetsRoot = lowerText.includes("invalid user root") || lowerText.includes("failed password for root") || lowerText.includes("for root");
    const targetsAdmin = lowerText.includes("for admin") || lowerText.includes("invalid user admin") || lowerText.includes("user administrator");

    if (targetsRoot || targetsAdmin) {
      authEvidence.push(`Privileged ${targetsRoot ? 'root' : 'admin'} account targeted in credential spray`);
      authFactors.push("Privileged account targeting (+15%)");
    }
    if (lowerText.includes("hydra") || lowerText.includes("medusa") || lowerText.includes("ncrack")) {
      authEvidence.push("Automated credential spraying tool signature detected in user-agent");
      authFactors.push("Known credential tool signature (+20%)");
    }
    if (lowerText.includes("maximum authentication attempts exceeded")) {
      authEvidence.push("SSH daemon maximum authentication attempt threshold exceeded");
      authFactors.push("Daemon max-attempt ceiling breach (+15%)");
    }

    const baseScore = 50 + Math.min(authFailCount * 5, 25) + (isRapidBurst ? 12 : 0) + (targetsRoot || targetsAdmin ? 15 : 0);
    const confidence = Math.min(96, Math.max(50, Math.round(baseScore)));
    
    // Derived Severity based on attempts, target privilege, and velocity
    let severity = "Medium";
    if (authFailCount >= 5 || (authFailCount >= 3 && targetsRoot) || lowerText.includes("hydra")) {
      severity = "Critical";
    } else if (authFailCount >= 4 || targetsRoot || targetsAdmin) {
      severity = "High";
    }

    return {
      detected: true,
      threatType: "SSH Brute Force",
      severity,
      confidence,
      confidenceReason: `Confidence score (${confidence}%) derived from ${authFailCount} repeated authentication failures across security telemetry stream${isRapidBurst ? ' within concentrated time window' : ''}.`,
      confidenceFactors: authFactors,
      evidence: authEvidence,
      indicators: authEvidence,
      sourceIp: authIp,
      affectedResource: "SSH / Host Authentication Gateways",
      description: `Iterative credential guessing attacks (${authFailCount} failures) detected targeting system accounts${authIp ? ` from ${authIp}` : ''}.`,
      eventCount: authFailCount,
      ruleMatched: "RULE-AUTH-001",
    };
  }

  // =========================================================================
  // 4. CROSS-SITE SCRIPTING (XSS) EVALUATION
  // =========================================================================
  const xssEvidence = [];
  const xssFactors = [];

  const matchingXssEvent = events.find((e) => {
    const m = `${(e.message || '').toLowerCase()} ${normalizeText(e.message || e.rawMessage || '')}`;
    return (
      m.includes("<script") || m.includes("</script>") ||
      m.includes("javascript:") || m.includes("vbscript:") ||
      m.includes("onerror=") || m.includes("onload=") || m.includes("onmouseover=") || m.includes("onclick=") ||
      m.includes("document.cookie") || m.includes("document.location") || m.includes("window.location") ||
      m.includes("<svg") || m.includes("<img") || m.includes("<iframe")
    );
  });
  const xssIp = matchingXssEvent && matchingXssEvent.sourceIp ? matchingXssEvent.sourceIp : topIp;

  if (lowerText.includes("<script") || lowerText.includes("</script>")) {
    xssEvidence.push("Explicit HTML script tag injection (<script>)");
    xssFactors.push("Script tag syntax (+25%)");
  }
  if (lowerText.includes("javascript:") || lowerText.includes("vbscript:")) {
    xssEvidence.push("Executable URI pseudo-protocol (javascript:)");
    xssFactors.push("Executable URI scheme (+20%)");
  }
  if (lowerText.includes("onerror=") || lowerText.includes("onload=") || lowerText.includes("onmouseover=") || lowerText.includes("onclick=")) {
    xssEvidence.push("Inline DOM event handler execution attribute (onerror=/onload=)");
    xssFactors.push("DOM event handler (+20%)");
  }
  if (lowerText.includes("document.cookie") || lowerText.includes("document.location") || lowerText.includes("window.location")) {
    xssEvidence.push("DOM session cookie / relocation sink access (document.cookie)");
    xssFactors.push("Cookie exfiltration sink (+25%)");
  }
  if (lowerText.includes("<svg") || lowerText.includes("<img") || lowerText.includes("<iframe")) {
    xssEvidence.push("HTML tag embedding payload (<svg>/<img>/<iframe>)");
    xssFactors.push("HTML tag embedding (+15%)");
  }

  if (xssEvidence.length > 0) {
    const baseScore = 58 + xssEvidence.length * 10;
    const confidence = Math.min(95, Math.round(baseScore));
    const isHigh = xssEvidence.some((e) => e.includes("cookie") || e.includes("script tag"));
    const severity = isHigh ? "High" : "Medium";

    return {
      detected: true,
      threatType: "Reflected XSS Injection",
      severity,
      confidence,
      confidenceReason: `Confidence score (${confidence}%) derived from ${xssEvidence.length} matched XSS signature(s): ${xssEvidence.join('; ')}.`,
      confidenceFactors: xssFactors,
      evidence: xssEvidence,
      indicators: xssEvidence,
      sourceIp: xssIp,
      affectedResource: "Client Web Sessions & Browser DOM",
      description: `Malicious client-side script injection payload intercepted in HTTP request telemetry${xssIp ? ` from ${xssIp}` : ''}.`,
      eventCount: events.length,
      ruleMatched: "RULE-XSS-001",
    };
  }

  // =========================================================================
  // 5. RECONNAISSANCE & PORT SCANNING EVALUATION
  // =========================================================================
  const scanEvidence = [];
  const scanFactors = [];

  const matchingScanEvent = events.find((e) => {
    const m = `${(e.message || '').toLowerCase()} ${normalizeText(e.message || e.rawMessage || '')}`;
    return (
      m.includes("nmap") || m.includes("masscan") || m.includes("zmap") || m.includes("angry ip") ||
      m.includes("port scan") || m.includes("syn scan") || m.includes("sweep") ||
      m.includes("connection refused on port") || m.includes("closed port probe")
    );
  });
  const scanIp = matchingScanEvent && matchingScanEvent.sourceIp ? matchingScanEvent.sourceIp : topIp;

  if (lowerText.includes("nmap") || lowerText.includes("masscan") || lowerText.includes("zmap") || lowerText.includes("angry ip")) {
    scanEvidence.push("Network reconnaissance scanner signature detected (Nmap/Masscan)");
    scanFactors.push("Known scanner user-agent / signature (+25%)");
  }
  if (lowerText.includes("port scan") || lowerText.includes("syn scan") || lowerText.includes("sweep")) {
    scanEvidence.push("Synchronous port probe scanning behavior logged");
    scanFactors.push("Sequential probe pattern (+20%)");
  }
  if (lowerText.includes("connection refused on port") || lowerText.includes("closed port probe")) {
    scanEvidence.push("Repeated connection rejection across closed destination ports");
    scanFactors.push("Closed port connection rejections (+20%)");
  }

  if (scanEvidence.length > 0) {
    const baseScore = 60 + scanEvidence.length * 12;
    const confidence = Math.min(92, Math.round(baseScore));
    const isMedium = scanEvidence.some((e) => e.includes("nmap") || e.includes("masscan"));
    const severity = isMedium ? "Medium" : "Low";

    return {
      detected: true,
      threatType: "Network Port Sweep",
      severity,
      confidence,
      confidenceReason: `Confidence score (${confidence}%) derived from ${scanEvidence.length} matched network reconnaissance pattern(s).`,
      confidenceFactors: scanFactors,
      evidence: scanEvidence,
      indicators: scanEvidence,
      sourceIp: scanIp,
      affectedResource: "Perimeter Network & Service Ports",
      description: `Reconnaissance scanning behavior targeting sequential service ports recorded${scanIp ? ` from ${scanIp}` : ''}.`,
      eventCount: events.length,
      ruleMatched: "RULE-RECON-001",
    };
  }

  // =========================================================================
  // 6. CLEAN TELEMETRY (NO THREATS DETECTED)
  // =========================================================================
  return {
    detected: false,
    threatType: "Clean Telemetry Baseline",
    severity: "Low",
    confidence: 0,
    confidenceReason: "Zero malicious indicators, injection tokens, or anomalous brute-force patterns identified in parsed events.",
    confidenceFactors: ["Zero signatures triggered (0%)"],
    evidence: [],
    indicators: [],
    sourceIp: topIp,
    affectedResource: "System Baseline Log Stream",
    description: "Standard system telemetry parsed. No abnormal attack vectors or malicious anomalies identified in log sample.",
    eventCount: events.length,
    ruleMatched: "NONE",
  };
};

module.exports = {
  classify,
};
