/**
 * sqli_real_pdf_e2e_test.js
 * Ingests a real sqli.log with long URI payloads, processes through the 4-agent pipeline,
 * creates an incident with containment actions, requests the real PDF via HTTP endpoint,
 * and saves it to disk for visual layout inspection.
 */

process.env.NODE_ENV = "test";

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const API_BASE = "http://127.0.0.1:5000/api";
const MONGO_URI = "mongodb://127.0.0.1:27017/aegissphere";

const Log = require("../models/Log");
const Threat = require("../models/Threat");
const Incident = require("../models/Incident");
const Report = require("../models/Report");
const User = require("../models/User");

const runSqliRealPdfTest = async () => {
  console.log("================================================================================");
  console.log("AEGISSPHERE: REAL sqli.log INGESTION & PDF STREAMING AUDIT");
  console.log("================================================================================\n");

  await mongoose.connect(MONGO_URI);
  console.log("✓ Connected to MongoDB.\n");

  const ts = Date.now();

  // 1. Authenticate Analyst
  const analystEmail = `sqli_pdf_analyst_${ts}@aegissphere.io`;
  const regRes = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Lead AppSec Analyst",
      email: analystEmail,
      password: "Password123!",
      role: "Analyst",
    }),
  });
  const regData = await regRes.json();
  const token = regData.token;
  const user = regData.user;
  const headers = { Authorization: `Bearer ${token}` };

  console.log(`1. Authenticated Analyst: ${analystEmail}`);

  // 2. Upload realistic sqli.log containing complex multi-query payloads
  const sqliLogContent = `
2026-09-09T12:00:01Z 198.51.100.77 web-gateway nginx: "GET /api/v1/products?category=electronics&sort=price%20AND%20(SELECT%201%20FROM%20(SELECT%20COUNT(*),CONCAT(version(),FLOOR(RAND(0)*2))x%20FROM%20information_schema.tables%20GROUP%20BY%20x)a)--%20- HTTP/1.1" 500 1420 "https://shop.aegissphere.io" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
2026-09-09T12:00:02Z 198.51.100.77 web-gateway nginx: "POST /api/v1/auth/login HTTP/1.1" 200 890 "username=admin' UNION SELECT null, id, username, password_hash, email, role, session_token FROM users WHERE '1'='1" "Mozilla/5.0"
2026-09-09T12:00:03Z 198.51.100.77 web-gateway nginx: "GET /api/v1/users/profile?id=1%20UNION%20ALL%20SELECT%20CONCAT_WS(':',table_name,column_name)%20FROM%20information_schema.columns--%20 HTTP/1.1" 200 4520 "Mozilla/5.0"
`.trim();

  const fd = new FormData();
  fd.append("logFile", new Blob([sqliLogContent], { type: "text/plain" }), "sqli.log");

  console.log("2. Uploading sqli.log through 4-agent security pipeline...");
  const uploadRes = await fetch(`${API_BASE}/logs/upload`, {
    method: "POST",
    headers,
    body: fd,
  });
  const uploadData = await uploadRes.json();

  if (uploadRes.status !== 200 || !uploadData.report) {
    console.error("Upload failed:", uploadData);
    process.exit(1);
  }

  const reportId = uploadData.report.id || uploadData.report._id;
  const threatId = uploadData.threat ? (uploadData.threat.id || uploadData.threat._id) : null;
  console.log(`✓ Log Ingested & Analyzed: Report ID = ${reportId}, Threat ID = ${threatId}`);

  // 3. Create an incident linked to this threat with multiple action items
  if (threatId) {
    console.log("3. Creating Incident Response Ticket with containment actions...");
    const incRes = await fetch(`${API_BASE}/incidents`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Active SQL Injection Database Extraction (sqli.log)",
        severity: "High",
        threatId: threatId,
        logId: uploadData.log.id || uploadData.log._id,
        description:
          "Critical multi-statement SQL injection exploiting the /api/v1/products and /api/v1/users endpoints to extract database schema catalogs and administrative credentials.",
      }),
    });
    const incData = await incRes.json();
    const incId = incData.incident?._id;

    if (incId) {
      // Add containment action
      await fetch(`${API_BASE}/incidents/${incId}/actions`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "Parameterized Query Sanitizer Deployed",
          notes: "Applied strict ORM parameter binding on search and category filters.",
        }),
      });

      await fetch(`${API_BASE}/incidents/${incId}/actions`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "Ingress WAF Rate Limit & IP Block",
          notes: "Blocked source IP 198.51.100.77 at Cloudflare edge gateway.",
        }),
      });
      console.log(`✓ Incident Created with 2 containment actions: Ticket ${incData.incident.incidentId}`);
    }
  }

  // 4. Request Real PDF via HTTP Endpoint
  console.log("4. Requesting Real PDF stream from /api/reports/:id/pdf...");
  const pdfRes = await fetch(`${API_BASE}/reports/${reportId}/pdf`, {
    headers,
  });

  if (pdfRes.status !== 200) {
    console.error("PDF generation endpoint returned status:", pdfRes.status);
    process.exit(1);
  }

  const arrayBuffer = await pdfRes.arrayBuffer();
  const pdfBuffer = Buffer.from(arrayBuffer);

  const outDir = path.resolve(__dirname, "../../test_output/pdf_layout_audits");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, "real_sqli_generated_report.pdf");
  fs.writeFileSync(outPath, pdfBuffer);

  console.log(`\n================================================================================`);
  console.log(`SUCCESS: Real sqli.log PDF generated and saved!`);
  console.log(`File Path: ${outPath}`);
  console.log(`File Size: ${pdfBuffer.length} bytes`);
  console.log(`PDF Header: ${pdfBuffer.slice(0, 8).toString()}`);
  console.log(`================================================================================\n`);

  await mongoose.disconnect();
};

runSqliRealPdfTest().catch((err) => {
  console.error("FATAL SQLI REAL PDF TEST ERROR:", err);
  process.exit(1);
});
