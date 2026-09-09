/**
 * LogParserAgent.js
 * Specialized Agent 1: Log Ingestion, Normalization & Structured Event Extraction.
 *
 * Responsibilities:
 * - Parses diverse security log formats: Linux Auth/Syslog, Web Server Access Logs (Apache/Nginx), CSV, JSON/JSONL.
 * - Normalizes lines into structured security event objects.
 * - Extracts fields strictly when present: timestamp, sourceIp, destinationIp, sourcePort, destinationPort,
 *   protocol, username, action, status, method, endpoint, userAgent, eventType, message, rawMessage.
 * - Never invents missing values (returns null or undefined).
 * - Aggregates parser metrics and distinct source IP lists across multi-event streams.
 */

// Strict IPv4 extraction helper
const extractIpv4 = (text) => {
  if (!text || typeof text !== 'string') return null;

  // 1. Key-Value patterns: src_ip=1.2.3.4, client_ip: "1.2.3.4", ip="1.2.3.4"
  const kvMatch = text.match(/(?:src_ip|client_ip|source_ip|remote_addr|ip|src|client)["':=\s]+([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/i);
  if (kvMatch && kvMatch[1]) {
    return isValidIp(kvMatch[1]) ? kvMatch[1] : null;
  }

  // 2. Syslog / Auth patterns: "from 1.2.3.4", "for <user> from 1.2.3.4"
  const authMatch = text.match(/\bfrom\s+([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\b/i);
  if (authMatch && authMatch[1]) {
    return isValidIp(authMatch[1]) ? authMatch[1] : null;
  }

  // 3. Web server line start: "1.2.3.4 - - [..."
  const webMatch = text.match(/^([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\s+-/);
  if (webMatch && webMatch[1]) {
    return isValidIp(webMatch[1]) ? webMatch[1] : null;
  }

  // 4. General search excluding broadcast/subnet masks
  const generalIps = text.match(/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g);
  if (generalIps && generalIps.length > 0) {
    const valid = generalIps.find((ip) => ip !== '255.255.255.0' && ip !== '255.255.255.255' && ip !== '0.0.0.0');
    return valid || null;
  }

  return null;
};

// Check if string is a valid IPv4 octet sequence
const isValidIp = (ipStr) => {
  if (!ipStr) return false;
  const parts = ipStr.split('.');
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    const n = Number(p);
    return !isNaN(n) && n >= 0 && n <= 255;
  });
};

// Extract timestamp from log line if available
const extractTimestamp = (text) => {
  if (!text) return null;

  // ISO 8601: 2026-06-14T03:12:01Z or 2026-06-14 03:12:01
  const isoMatch = text.match(/\b\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?\b/);
  if (isoMatch) {
    const d = new Date(isoMatch[0]);
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  // Syslog: Jun 14 03:12:01 or Jun  4 03:12:01
  const syslogMatch = text.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s+(\d{2}:\d{2}:\d{2})\b/i);
  if (syslogMatch) {
    const currentYear = new Date().getFullYear();
    const d = new Date(`${syslogMatch[1]} ${syslogMatch[2]} ${currentYear} ${syslogMatch[3]}`);
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  // Web access: [14/Jun/2026:03:12:01 +0000]
  const webMatch = text.match(/\[(\d{2}\/[A-Za-z]{3}\/\d{4}:\d{2}:\d{2}:\d{2}\s+[+-]\d{4})\]/);
  if (webMatch) {
    const cleaned = webMatch[1].replace(':', ' ');
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  return null;
};

// Parse single log line into structured format
const parseLine = (line, index) => {
  const trimmed = (line || '').trim();
  if (!trimmed) return null;

  const sourceIp = extractIpv4(trimmed);
  const timestamp = extractTimestamp(trimmed);

  // Extract username if in auth log
  let username = null;
  const userMatch = trimmed.match(/\b(?:for|user)\s+(?:invalid user\s+)?([A-Za-z0-9_.-]+)\b/i);
  if (userMatch && userMatch[1] && !['password', 'from', 'port', 'ssh2', 'accepted', 'failed'].includes(userMatch[1].toLowerCase())) {
    username = userMatch[1];
  }

  // Extract port if present
  let sourcePort = null;
  const portMatch = trimmed.match(/\b(?:port|src_port|sport)\s*[:=]?\s*(\d{1,5})\b/i);
  if (portMatch && portMatch[1]) {
    sourcePort = parseInt(portMatch[1], 10);
  }

  // Extract destination IP if present
  let destinationIp = null;
  const dstIpMatch = trimmed.match(/(?:dst_ip|destination_ip|dst|to)["':=\s]+([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/i);
  if (dstIpMatch && dstIpMatch[1] && isValidIp(dstIpMatch[1])) {
    destinationIp = dstIpMatch[1];
  }

  // Extract destination port if present
  let destinationPort = null;
  const dstPortMatch = trimmed.match(/\b(?:dst_port|destination_port|dport|dstport)\s*[:=]?\s*(\d{1,5})\b/i);
  if (dstPortMatch && dstPortMatch[1]) {
    destinationPort = parseInt(dstPortMatch[1], 10);
  }

  // Extract HTTP method and endpoint if present
  let method = null;
  let endpoint = null;
  let status = null;
  const httpMatch = trimmed.match(/"(GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH)\s+([^\s]+)\s+HTTP\/[0-9.]+"/i);
  if (httpMatch) {
    method = httpMatch[1].toUpperCase();
    endpoint = httpMatch[2];
  }

  // Extract HTTP status code
  const statusMatch = trimmed.match(/"\s+(\d{3})\s+\d+/);
  if (statusMatch) {
    status = parseInt(statusMatch[1], 10);
  }

  // Extract User Agent
  let userAgent = null;
  const uaMatches = trimmed.match(/"\s+"([^"]+)"$/);
  if (uaMatches && uaMatches[1]) {
    userAgent = uaMatches[1];
  }

  return {
    index,
    timestamp,
    sourceIp,
    destinationIp,
    sourcePort,
    destinationPort,
    protocol: trimmed.toLowerCase().includes('ssh') ? 'SSH' : trimmed.toLowerCase().includes('http') ? 'HTTP' : 'TCP',
    username,
    action: method || (trimmed.toLowerCase().includes('failed') ? 'FAILED_AUTH' : trimmed.toLowerCase().includes('accepted') ? 'ACCEPTED_AUTH' : 'EVENT'),
    status: status ? String(status) : trimmed.toLowerCase().includes('failed') ? 'FAILURE' : 'SUCCESS',
    method,
    endpoint,
    userAgent,
    eventType: method ? 'WEB_REQUEST' : trimmed.toLowerCase().includes('sshd') ? 'AUTH_EVENT' : 'SYSTEM_LOG',
    message: trimmed,
    rawMessage: line,
  };
};

// Parse JSON formatted logs
const parseJsonContent = (content) => {
  const events = [];
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

  // Attempt JSON Array or JSON Lines
  try {
    const fullParsed = JSON.parse(content);
    if (Array.isArray(fullParsed)) {
      return fullParsed.map((item, idx) => ({
        index: idx,
        timestamp: item.timestamp || item.time || item.createdAt || null,
        sourceIp: item.src_ip || item.source_ip || item.client_ip || item.ip || extractIpv4(JSON.stringify(item)),
        destinationIp: item.dst_ip || item.destination_ip || null,
        sourcePort: item.src_port || item.source_port || null,
        destinationPort: item.dst_port || item.destination_port || item.port || null,
        protocol: item.protocol || item.proto || 'TCP',
        username: item.username || item.user || null,
        action: item.action || item.method || 'EVENT',
        status: item.status || (item.error ? 'FAILURE' : 'SUCCESS'),
        method: item.method || null,
        endpoint: item.endpoint || item.url || item.path || null,
        userAgent: item.user_agent || item.userAgent || null,
        eventType: item.event_type || item.type || 'STRUCTURED_JSON',
        message: item.message || item.msg || JSON.stringify(item),
        rawMessage: JSON.stringify(item),
      }));
    }
  } catch (e) {
    // Not a single JSON array, proceed with JSON Lines
  }

  lines.forEach((l, idx) => {
    try {
      const obj = JSON.parse(l);
      events.push({
        index: idx,
        timestamp: obj.timestamp || obj.time || null,
        sourceIp: obj.src_ip || obj.source_ip || obj.client_ip || obj.ip || extractIpv4(l),
        destinationIp: obj.dst_ip || obj.destination_ip || null,
        sourcePort: obj.src_port || obj.source_port || null,
        destinationPort: obj.dst_port || obj.destination_port || null,
        protocol: obj.protocol || 'TCP',
        username: obj.username || obj.user || null,
        action: obj.action || obj.method || 'EVENT',
        status: obj.status || (obj.error ? 'FAILURE' : 'SUCCESS'),
        method: obj.method || null,
        endpoint: obj.endpoint || obj.url || obj.path || null,
        userAgent: obj.user_agent || null,
        eventType: obj.event_type || obj.type || 'JSON_LINE',
        message: obj.message || obj.msg || l,
        rawMessage: l,
      });
    } catch (err) {
      // Fallback to text parsing for this line
      const ev = parseLine(l, idx);
      if (ev) events.push(ev);
    }
  });

  return events;
};

// Parse CSV formatted logs
const parseCsvContent = (content) => {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
  const hasIpHeader = headers.some((h) => h.includes('ip') || h.includes('src') || h.includes('client'));

  if (!hasIpHeader && !lines[0].includes(',')) {
    // Not standard CSV, fallback to standard text parser
    return lines.map((l, idx) => parseLine(l, idx)).filter(Boolean);
  }

  const events = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length === headers.length) {
      const row = {};
      headers.forEach((h, colIdx) => {
        row[h] = cols[colIdx];
      });

      events.push({
        index: i - 1,
        timestamp: row.timestamp || row.time || row.date || extractTimestamp(lines[i]),
        sourceIp: row.src_ip || row.source_ip || row.client_ip || row.ip || extractIpv4(lines[i]),
        destinationIp: row.dst_ip || row.destination_ip || null,
        sourcePort: row.src_port ? parseInt(row.src_port, 10) : null,
        destinationPort: row.dst_port ? parseInt(row.dst_port, 10) : (row.port ? parseInt(row.port, 10) : null),
        protocol: row.protocol || row.proto || 'TCP',
        username: row.username || row.user || null,
        action: row.action || row.event || 'CSV_EVENT',
        status: row.status || 'RECORDED',
        method: row.method || null,
        endpoint: row.endpoint || row.url || null,
        userAgent: row.user_agent || null,
        eventType: row.event_type || 'CSV_RECORD',
        message: lines[i],
        rawMessage: lines[i],
      });
    } else {
      const ev = parseLine(lines[i], i);
      if (ev) events.push(ev);
    }
  }

  return events;
};

/**
 * LogParserAgent Main Parsing Function
 * @param {string} logContent - Raw content of the log file
 * @param {string} fileFormat - File extension (.log, .txt, .csv, .json)
 * @returns {object} Structured events array + summary statistics
 */
const parse = async (logContent, fileFormat = '.log') => {
  const rawText = logContent || '';
  if (!rawText.trim()) {
    return {
      success: true,
      events: [],
      stats: {
        totalLines: 0,
        parsedEventsCount: 0,
        primarySourceIp: null,
        distinctSourceIps: [],
        hasTimestamps: false,
        format: fileFormat,
      },
    };
  }

  let events = [];
  const fmt = (fileFormat || '').toLowerCase();

  if (fmt === '.json' || rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
    events = parseJsonContent(rawText);
  } else if (fmt === '.csv' || (rawText.split('\n')[0] && rawText.split('\n')[0].includes(',') && rawText.split('\n')[0].includes('ip'))) {
    events = parseCsvContent(rawText);
  } else {
    // Default Line-by-line parsing for plain text, auth logs, access logs, syslog
    const rawLines = rawText.split(/\r?\n/);
    events = rawLines.map((line, idx) => parseLine(line, idx)).filter(Boolean);
  }

  // Compute aggregated stats
  const distinctIps = Array.from(
    new Set(events.map((e) => e.sourceIp).filter((ip) => ip !== null && isValidIp(ip)))
  );

  const primarySourceIp = distinctIps.length > 0 ? distinctIps[0] : null;
  const hasTimestamps = events.some((e) => e.timestamp !== null);

  return {
    success: true,
    events,
    stats: {
      totalLines: rawText.split(/\r?\n/).length,
      parsedEventsCount: events.length,
      primarySourceIp,
      distinctSourceIps: distinctIps,
      hasTimestamps,
      format: fileFormat,
    },
  };
};

module.exports = {
  parse,
  extractIpv4,
  extractTimestamp,
  parseLine,
};
