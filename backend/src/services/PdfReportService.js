const PDFDocument = require("pdfkit");

/**
 * Service to generate professional SOC audit PDF reports from MongoDB records.
 * Features deterministic y-coordinate tracking, dynamic box height calculation,
 * safe page-break pagination, and clean typography without collisions.
 */
class PdfReportService {
  /**
   * Generates a PDF stream and pipes it to the response
   * @param {Object} reportData - Object containing report, log, threats, incidents, user
   * @param {Object} res - Express response stream
   */
  static generateReportPdf(reportData, res) {
    const { report, log, threats = [], incidents = [], requestingUser } = reportData;

    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: 40,
        bottom: 50,
        left: 40,
        right: 40,
      },
      bufferPages: true,
      compress: false,
      info: {
        Title: report.title || "AegisSphere SOC Security Report",
        Author: "AegisSphere SOC Platform",
        Subject: "Cybersecurity Incident & Threat Audit",
        Keywords: "SOC, Cybersecurity, Threat Detection, Incident Response, Audit",
        CreationDate: new Date(),
      },
    });

    // Pipe to HTTP response
    doc.pipe(res);

    const leftMargin = 40;
    const pageWidth = doc.page.width - leftMargin * 2; // 595.28 - 80 = 515.28 pt

    // Helper: Check if sufficient vertical space remains before bottom margin; if not, add page
    const ensureSpace = (neededHeight) => {
      const bottomLimit = doc.page.height - doc.page.margins.bottom;
      if (doc.y + neededHeight > bottomLimit) {
        doc.addPage();
      }
    };

    // Helper: Draw main section header with background bar
    const drawSectionHeader = (title, iconText = ">>") => {
      ensureSpace(48);
      doc.moveDown(0.5);
      const headerY = doc.y;
      const barHeight = 22;

      // Dark background bar
      doc.rect(leftMargin, headerY, pageWidth, barHeight).fill("#0F172A");

      // Title text inside bar
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#FFFFFF")
        .text(`${iconText}  ${title.toUpperCase()}`, leftMargin + 10, headerY + 6, {
          width: pageWidth - 20,
          lineBreak: false,
        });

      // Explicitly advance doc.y to strictly BELOW the header bar with 8pt margin
      doc.y = headerY + barHeight + 8;
    };

    // Helper: Draw sub-header bar (for Threat cards, AI block, Incident tickets)
    const drawSubHeader = (title, bgColor = "#334155", textColor = "#FFFFFF") => {
      ensureSpace(40);
      const barY = doc.y;
      const barHeight = 20;

      doc.rect(leftMargin, barY, pageWidth, barHeight).fill(bgColor);

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(textColor)
        .text(title, leftMargin + 8, barY + 5.5, {
          width: pageWidth - 16,
          lineBreak: false,
        });

      // Advance doc.y to below subheader bar
      doc.y = barY + barHeight + 6;
    };

    // Helper: Draw key-value row with automatic text wrapping and height calculation
    const drawKeyValue = (label, value, indent = 0) => {
      const startX = leftMargin + indent;
      const labelWidth = 135;
      const valX = startX + labelWidth + 6;
      const valWidth = pageWidth - labelWidth - indent - 6;
      const textVal = String(value !== undefined && value !== null ? value : "Not available");

      // Measure required heights
      doc.font("Helvetica-Bold").fontSize(8.5);
      const labelH = doc.heightOfString(label, { width: labelWidth });
      doc.font("Helvetica").fontSize(8.5);
      const valH = doc.heightOfString(textVal, { width: valWidth, lineGap: 1.5 });
      const rowH = Math.max(labelH, valH);

      // Prevent splitting short rows across page breaks
      if (rowH < 120) {
        ensureSpace(rowH + 3);
      } else {
        ensureSpace(28);
      }

      const curY = doc.y;

      // Render Label
      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor("#334155")
        .text(label, startX, curY, { width: labelWidth });

      // Render Value
      doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor("#0F172A")
        .text(textVal, valX, curY, { width: valWidth, lineGap: 1.5 });

      // Advance doc.y to after whichever column was taller + padding
      doc.y = Math.max(doc.y, curY + rowH) + 3.5;
    };

    // =========================================================================
    // 1. COVER / HEADER BANNER
    // =========================================================================
    const headerHeight = 62;
    const startY = 40;

    doc.rect(leftMargin, startY, pageWidth, headerHeight).fill("#1E293B");

    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .fillColor("#38BDF8")
      .text("AEGISSPHERE", leftMargin + 15, startY + 14, { lineBreak: false });

    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor("#94A3B8")
      .text("Security Operations Center (SOC) Audit Report", leftMargin + 15, startY + 36, { lineBreak: false });

    const reportDateStr = report.createdAt ? new Date(report.createdAt).toUTCString() : new Date().toUTCString();
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#EF4444")
      .text("CONFIDENTIAL // SOC AUDIT", leftMargin + pageWidth - 210, startY + 15, {
        width: 195,
        align: "right",
        lineBreak: false,
      });

    doc
      .font("Helvetica")
      .fontSize(7.5)
      .fillColor("#CBD5E1")
      .text(`Generated: ${reportDateStr}`, leftMargin + pageWidth - 210, startY + 32, {
        width: 195,
        align: "right",
        lineBreak: false,
      });

    doc.y = startY + headerHeight + 12;

    // =========================================================================
    // 2. REPORT METADATA CARD (DYNAMICALLY CALCULATED HEIGHT)
    // =========================================================================
    const generatedByStr = report.generatedBy
      ? `${report.generatedBy.name || "SOC Operator"} (${report.generatedBy.email || "N/A"}) [Role: ${report.generatedBy.role || "Analyst"}]`
      : "Automated SOC Multi-Agent Pipeline";

    const metaRows = [
      ["Report Title:", report.title || "SOC Forensic Audit Report"],
      ["Report ID:", String(report._id)],
      ["Generated By:", generatedByStr],
      ["Report Status:", report.status || "Generated"],
    ];

    if (log) {
      const fileSizeStr = log.fileSize ? `${(log.fileSize / 1024).toFixed(1)} KB` : "N/A";
      const logFmt = log.fileFormat || "";
      metaRows.push([
        "Associated Log File:",
        `${log.originalName || log.filename} (${fileSizeStr}${logFmt ? ` | ${logFmt}` : ""})`,
      ]);
    }

    const labelWidth = 130;
    const valWidth = pageWidth - labelWidth - 24;
    const paddingX = 12;
    const paddingY = 8;
    const rowSpacing = 4;

    let totalContentHeight = 0;
    const measuredRows = metaRows.map(([label, val]) => {
      doc.font("Helvetica-Bold").fontSize(8.5);
      const lh = doc.heightOfString(label, { width: labelWidth });
      doc.font("Helvetica").fontSize(8.5);
      const vh = doc.heightOfString(String(val || "N/A"), { width: valWidth, lineGap: 1 });
      const rh = Math.max(lh, vh);
      totalContentHeight += rh + rowSpacing;
      return { label, val: String(val || "N/A"), rh };
    });

    const cardHeight = totalContentHeight + paddingY * 2 - rowSpacing;
    ensureSpace(cardHeight + 10);

    const cardY = doc.y;

    doc
      .rect(leftMargin, cardY, pageWidth, cardHeight)
      .lineWidth(0.75)
      .strokeColor("#CBD5E1")
      .fillAndStroke("#F8FAFC", "#CBD5E1");

    let curMetaY = cardY + paddingY;
    measuredRows.forEach(({ label, val, rh }) => {
      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor("#334155")
        .text(label, leftMargin + paddingX, curMetaY, { width: labelWidth, lineBreak: false });

      doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor("#0F172A")
        .text(val, leftMargin + paddingX + labelWidth, curMetaY, { width: valWidth, lineGap: 1 });

      curMetaY += rh + rowSpacing;
    });

    doc.y = cardY + cardHeight + 10;

    // =========================================================================
    // 3. EXECUTIVE SUMMARY
    // =========================================================================
    drawSectionHeader("1. Executive Summary");

    const summaryText = (
      report.summary ||
      "No executive summary provided. This audit captures authoritative security telemetry parsed and classified by the AegisSphere SOC pipeline."
    ).trim();

    ensureSpace(30);
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#1E293B")
      .text(summaryText, leftMargin, doc.y, {
        width: pageWidth,
        lineGap: 3,
      });

    doc.y = doc.y + 8;

    // =========================================================================
    // 4. THREAT TELEMETRY SUMMARY (METRIC GRID)
    // =========================================================================
    drawSectionHeader("2. Threat Telemetry Summary");

    const totalThreats = threats.length;
    const criticalCount = threats.filter((t) => t.severity === "Critical").length;
    const highCount = threats.filter((t) => t.severity === "High").length;
    const mediumCount = threats.filter((t) => t.severity === "Medium").length;
    const lowCount = threats.filter((t) => t.severity === "Low").length;
    const resolvedCount = threats.filter(
      (t) => t.status === "Resolved" || t.status === "Closed" || t.status === "Mitigated"
    ).length;

    const numBoxes = 5;
    const boxSpacing = 6;
    const boxWidth = (pageWidth - (numBoxes - 1) * boxSpacing) / numBoxes;
    const boxHeight = 44;

    ensureSpace(boxHeight + 16);
    const gridY = doc.y;

    const metrics = [
      { label: "TOTAL THREATS", count: totalThreats, bg: "#F1F5F9", text: "#0F172A", border: "#CBD5E1" },
      { label: "CRITICAL", count: criticalCount, bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" },
      { label: "HIGH", count: highCount, bg: "#FFEDD5", text: "#9A3412", border: "#FDBA74" },
      { label: "MEDIUM", count: mediumCount, bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" },
      { label: "LOW / RESOLVED", count: `${lowCount} / ${resolvedCount}`, bg: "#E0F2FE", text: "#075985", border: "#7DD3FC" },
    ];

    metrics.forEach((m, idx) => {
      const bX = leftMargin + idx * (boxWidth + boxSpacing);
      doc.rect(bX, gridY, boxWidth, boxHeight).fill(m.bg);
      doc.rect(bX, gridY, boxWidth, boxHeight).lineWidth(0.5).strokeColor(m.border).stroke();

      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .fillColor(m.text)
        .text(String(m.count), bX, gridY + 7, { width: boxWidth, align: "center", lineBreak: false });

      doc
        .font("Helvetica-Bold")
        .fontSize(6.5)
        .fillColor(m.text)
        .text(m.label, bX, gridY + 27, { width: boxWidth, align: "center", lineBreak: false });
    });

    doc.y = gridY + boxHeight + 12;

    // =========================================================================
    // 5. DETECTED THREAT DETAILS
    // =========================================================================
    drawSectionHeader("3. Detected Threat Details");

    if (threats.length === 0) {
      ensureSpace(25);
      doc
        .font("Helvetica-Oblique")
        .fontSize(9)
        .fillColor("#64748B")
        .text("No threat records associated with this report.", leftMargin, doc.y, { width: pageWidth });
      doc.y = doc.y + 8;
    } else {
      threats.forEach((threat, index) => {
        let barColor = "#334155";
        if (threat.severity === "Critical") barColor = "#7F1D1D";
        else if (threat.severity === "High") barColor = "#9A3412";
        else if (threat.severity === "Medium") barColor = "#854D0E";
        else if (threat.severity === "Low") barColor = "#1E40AF";

        drawSubHeader(
          `Threat #${index + 1}: ${threat.threatType || "Unclassified Threat"}  [Severity: ${threat.severity || "Unknown"}]`,
          barColor,
          "#FFFFFF"
        );

        drawKeyValue("Threat Type:", threat.threatType, 4);
        drawKeyValue("Severity Level:", threat.severity, 4);
        drawKeyValue(
          "Detection Confidence:",
          threat.confidence !== undefined && threat.confidence !== null
            ? `${threat.confidence}% (Deterministic Rule Math)`
            : "Not available",
          4
        );
        if (threat.confidenceReason) {
          drawKeyValue("Confidence Rationale:", threat.confidenceReason, 4);
        }
        drawKeyValue("Source IP Address:", threat.sourceIp || "Not available (Preserved as Null)", 4);
        if (threat.destinationIp) {
          drawKeyValue("Destination IP:", threat.destinationIp, 4);
        }
        drawKeyValue("MITRE ATT&CK ID:", threat.mitreTechnique || "Not available", 4);
        drawKeyValue(
          "Matched Indicators:",
          threat.matchedIndicators && threat.matchedIndicators.length > 0
            ? threat.matchedIndicators.join(", ")
            : "Not available",
          4
        );
        drawKeyValue("Description:", threat.description || "Not available", 4);
        drawKeyValue("Remediation Guidance:", threat.recommendation || "Not available", 4);
        drawKeyValue(
          "Detection Timestamp:",
          threat.createdAt ? new Date(threat.createdAt).toUTCString() : "Not available",
          4
        );
        drawKeyValue("Lifecycle Status:", threat.status || "Active", 4);

        // --- AI ASSISTED ANALYSIS BLOCK ---
        if (threat.aiAnalysis && threat.aiAnalysis.summary) {
          doc.y = doc.y + 4;
          drawSubHeader(
            "* AI-ASSISTED CONTEXTUAL ANALYSIS (GOOGLE GEMINI)",
            "#1E1B4B",
            "#A5B4FC"
          );

          drawKeyValue("AI Model / Version:", threat.aiAnalysis.model || "gemini-2.5-flash", 8);
          drawKeyValue(
            "Analysis Confidence:",
            threat.aiAnalysis.confidenceInAnalysis
              ? String(threat.aiAnalysis.confidenceInAnalysis).toUpperCase()
              : "Not available",
            8
          );
          drawKeyValue(
            "Generated Timestamp:",
            threat.aiAnalysis.generatedAt ? new Date(threat.aiAnalysis.generatedAt).toUTCString() : "Not available",
            8
          );
          drawKeyValue("Executive Summary:", threat.aiAnalysis.summary, 8);

          if (threat.aiAnalysis.whySuspicious && threat.aiAnalysis.whySuspicious.length > 0) {
            drawKeyValue("Suspicion Factors:", threat.aiAnalysis.whySuspicious.join(" | "), 8);
          }
          if (threat.aiAnalysis.observedEvidence && threat.aiAnalysis.observedEvidence.length > 0) {
            drawKeyValue("Observed Evidence:", threat.aiAnalysis.observedEvidence.join(" | "), 8);
          }
          if (threat.aiAnalysis.investigationSteps && threat.aiAnalysis.investigationSteps.length > 0) {
            drawKeyValue("Investigation Steps:", threat.aiAnalysis.investigationSteps.join(" -> "), 8);
          }
          if (threat.aiAnalysis.remediation && threat.aiAnalysis.remediation.length > 0) {
            drawKeyValue("AI Remediation Advice:", threat.aiAnalysis.remediation.join(" | "), 8);
          }
          if (threat.aiAnalysis.riskContext) {
            drawKeyValue("Risk Context:", threat.aiAnalysis.riskContext, 8);
          }
          if (threat.aiAnalysis.uncertainty) {
            drawKeyValue("Analytic Uncertainty:", threat.aiAnalysis.uncertainty, 8);
          }
        } else {
          ensureSpace(20);
          doc
            .font("Helvetica-Oblique")
            .fontSize(8)
            .fillColor("#64748B")
            .text("AI-assisted analysis was not generated for this threat.", leftMargin + 6, doc.y, {
              width: pageWidth - 12,
            });
          doc.y = doc.y + 6;
        }

        if (index < threats.length - 1) {
          doc.y = doc.y + 6;
          doc.rect(leftMargin, doc.y, pageWidth, 0.5).fill("#E2E8F0");
          doc.y = doc.y + 8;
        } else {
          doc.y = doc.y + 6;
        }
      });
    }

    // =========================================================================
    // 6. INCIDENT RESPONSE MANAGEMENT & AUDIT TRAIL
    // =========================================================================
    drawSectionHeader("4. Incident Response & Containment Audit");

    if (incidents.length === 0) {
      ensureSpace(25);
      doc
        .font("Helvetica-Oblique")
        .fontSize(9)
        .fillColor("#64748B")
        .text("No incident records associated with this report.", leftMargin, doc.y, { width: pageWidth });
      doc.y = doc.y + 8;
    } else {
      incidents.forEach((inc, idx) => {
        drawSubHeader(
          `Incident Ticket [${inc.incidentId || inc._id}]: ${inc.title || "Incident Case"} — Status: ${inc.status || "Active"}`,
          "#0F766E",
          "#FFFFFF"
        );

        drawKeyValue("Severity Level:", inc.severity || "Not specified", 4);
        drawKeyValue("Lifecycle Status:", inc.status || "Active", 4);
        drawKeyValue(
          "Assigned Analyst:",
          inc.assignedTo ? `${inc.assignedTo.name || "Analyst"} (${inc.assignedTo.email || "N/A"})` : "Unassigned",
          4
        );
        drawKeyValue("Created Timestamp:", inc.createdAt ? new Date(inc.createdAt).toUTCString() : "Not available", 4);
        drawKeyValue("Updated Timestamp:", inc.updatedAt ? new Date(inc.updatedAt).toUTCString() : "Not available", 4);
        if (inc.description) {
          drawKeyValue("Incident Description:", inc.description, 4);
        }

        // Action History / Containment Audit Trail
        if (inc.actionHistory && inc.actionHistory.length > 0) {
          ensureSpace(30);
          doc.y = doc.y + 4;
          doc
            .font("Helvetica-Bold")
            .fontSize(8.5)
            .fillColor("#0F172A")
            .text("Containment Action Audit Trail:", leftMargin + 4, doc.y, { width: pageWidth - 8 });
          doc.y = doc.y + 4;

          inc.actionHistory.forEach((act) => {
            const opName = act.performedByName || (act.performedBy && act.performedBy.name) || "SOC Operator";
            const timeStr = act.timestamp ? new Date(act.timestamp).toUTCString() : "Recent";
            const noteStr = act.notes ? ` (${act.notes})` : "";
            const actionLine = `- [${timeStr}] ${act.action || "Action"} — Status: ${act.status || "Executed"} by ${opName}${noteStr}`;

            doc.font("Helvetica").fontSize(8);
            const lineH = doc.heightOfString(actionLine, { width: pageWidth - 24, lineGap: 1 });
            ensureSpace(lineH + 3);

            const curActionY = doc.y;
            doc
              .fillColor("#334155")
              .text(actionLine, leftMargin + 10, curActionY, { width: pageWidth - 24, lineGap: 1 });
            doc.y = curActionY + lineH + 3;
          });

          ensureSpace(20);
          doc.y = doc.y + 2;
          doc
            .font("Helvetica-Oblique")
            .fontSize(7.5)
            .fillColor("#64748B")
            .text(
              "* Action recorded in AegisSphere audit system. (No external hardware/infrastructure was directly modified).",
              leftMargin + 10,
              doc.y,
              { width: pageWidth - 20 }
            );
          doc.y = doc.y + 6;
        } else {
          ensureSpace(20);
          doc
        .font("Helvetica-Oblique")
        .fontSize(8)
        .fillColor("#64748B")
        .text("No response actions recorded for this incident.", leftMargin + 4, doc.y, {
          width: pageWidth - 10,
        });
          doc.y = doc.y + 6;
        }

        if (idx < incidents.length - 1) {
          doc.y = doc.y + 4;
          doc.rect(leftMargin, doc.y, pageWidth, 0.5).fill("#E2E8F0");
          doc.y = doc.y + 6;
        }
      });
    }

    // =========================================================================
    // 7. FOOTER & PAGE NUMBERING (ALL BUFFERED PAGES)
    // =========================================================================
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);

      // Footer divider line
      doc
        .rect(leftMargin, doc.page.height - 35, pageWidth, 0.5)
        .fill("#CBD5E1");

      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor("#64748B")
        .text(
          "CONFIDENTIAL & PROPRIETARY — SOC AUDIT REPORT. Generated by AegisSphere Cybersecurity Platform.",
          leftMargin,
          doc.page.height - 26,
          { width: pageWidth / 2 + 60, align: "left", lineBreak: false }
        );

      doc
        .font("Helvetica-Bold")
        .fontSize(7.5)
        .fillColor("#475569")
        .text(`Page ${i + 1} of ${range.count}`, leftMargin + pageWidth / 2, doc.page.height - 26, {
          width: pageWidth / 2,
          align: "right",
          lineBreak: false,
        });
    }

    // Finalize the PDF stream
    doc.end();
  }
}

module.exports = PdfReportService;
