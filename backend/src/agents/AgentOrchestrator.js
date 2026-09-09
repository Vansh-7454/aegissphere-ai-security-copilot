/**
 * AgentOrchestrator.js
 * Multi-Agent Pipeline Coordinator for AegisSphere.
 *
 * Coordinates the 4 specialized backend agents:
 * Stage 1: LogParserAgent          -> Ingestion, token extraction & normalization into structured events
 * Stage 2: ThreatClassifierAgent   -> Heuristic pattern recognition, event correlation, and confidence scoring
 * Stage 3: ThreatIntelligenceAgent -> MITRE ATT&CK contextual mapping & tactical classification
 * Stage 4: RemediationAgent        -> Actionable containment playbooks & investigation steps
 *
 * Ensures safe execution with stage-level isolation and returns unified pipeline contracts.
 */

const LogParserAgent = require("./LogParserAgent");
const ThreatClassifierAgent = require("./ThreatClassifierAgent");
const ThreatIntelligenceAgent = require("./ThreatIntelligenceAgent");
const RemediationAgent = require("./RemediationAgent");

/**
 * Orchestrates the complete end-to-end multi-agent security analysis pipeline.
 *
 * @param {string} logContent - Raw uploaded security log content
 * @param {object} options - Configuration options (fileFormat, originalName, metadata)
 * @returns {Promise<object>} Unified pipeline execution result
 */
const orchestrateAnalysis = async (logContent = "", options = {}) => {
  const startTime = Date.now();
  const fileFormat = options.fileFormat || options.ext || ".log";

  try {
    // -------------------------------------------------------------
    // STAGE 1: Log Ingestion & Normalization (LogParserAgent)
    // -------------------------------------------------------------
    const parserResult = await LogParserAgent.parse(logContent, fileFormat);
    const parsedEvents = parserResult.events || [];
    const parserStats = parserResult.stats || {};

    // -------------------------------------------------------------
    // STAGE 2: Threat Detection & Classification (ThreatClassifierAgent)
    // -------------------------------------------------------------
    const classification = await ThreatClassifierAgent.classify(parsedEvents, parserStats);
    const isThreat = classification.detected === true;

    // -------------------------------------------------------------
    // STAGE 3: Threat Intelligence Enrichment (ThreatIntelligenceAgent)
    // Safe execution: if intelligence fails, detection still succeeds
    // -------------------------------------------------------------
    let intelligence = {
      mitreTechnique: isThreat ? "T1059 - General Security Vector" : "T1005 - Data from Local System",
      tacticId: isThreat ? "TA0001" : "TA0009",
      intelligenceAvailable: false,
    };

    try {
      intelligence = await ThreatIntelligenceAgent.enrich(classification);
    } catch (intelErr) {
      console.warn("ThreatIntelligenceAgent warning:", intelErr.message);
    }

    // -------------------------------------------------------------
    // STAGE 4: Remediation Formulation (RemediationAgent)
    // Safe execution: if remediation fails, threat record is preserved
    // -------------------------------------------------------------
    let remediation = {
      recommendation: isThreat
        ? "Review security log telemetry, inspect affected endpoints, and apply perimeter filtering."
        : "Continue regular log archiving and automated telemetry auditing.",
      containmentType: isThreat ? "Standard Investigation" : "Baseline Maintenance",
      playbookActions: [],
      investigationSteps: [],
    };

    try {
      remediation = await RemediationAgent.formulate(classification, intelligence);
    } catch (remErr) {
      console.warn("RemediationAgent warning:", remErr.message);
    }

    const durationMs = Date.now() - startTime;

    // -------------------------------------------------------------
    // COMPILE UNIFIED CONTRACT COMPATIBLE WITH MONGODB MODELS
    // -------------------------------------------------------------
    return {
      success: true,
      isThreat,
      threatType: classification.threatType,
      severity: classification.severity,
      confidence: classification.confidence,
      confidenceReason: classification.confidenceReason,
      confidenceFactors: classification.confidenceFactors || [],
      matchedIndicators: classification.indicators || [],
      evidence: classification.evidence || [],
      mitreTechnique: intelligence.mitreTechnique || "T1059",
      mitreTactic: intelligence.mitreTactic || "Initial Access",
      description: classification.description,
      recommendation: remediation.recommendation,
      sourceIp: classification.sourceIp || null,
      affectedResource: classification.affectedResource || null,
      eventCount: classification.eventCount || parsedEvents.length,

      // Rich Agent Telemetry Metadata
      agentTelemetry: {
        pipelineVersion: "2.0.0-multi-agent",
        durationMs,
        stages: {
          parser: {
            status: "Completed",
            eventsCount: parsedEvents.length,
            totalLines: parserStats.totalLines || 0,
            primarySourceIp: parserStats.primarySourceIp,
            distinctSourceIps: parserStats.distinctSourceIps || [],
          },
          classifier: {
            status: "Completed",
            ruleMatched: classification.ruleMatched,
            detected: isThreat,
            confidenceScore: classification.confidence,
          },
          intelligence: {
            status: intelligence.intelligenceAvailable ? "Enriched" : "Local Baseline",
            techniqueId: intelligence.techniqueId,
            mitreTactic: intelligence.mitreTactic,
          },
          remediation: {
            status: "Formulated",
            containmentType: remediation.containmentType,
            playbookCount: (remediation.playbookActions || []).length,
            playbookActions: remediation.playbookActions || [],
            investigationSteps: remediation.investigationSteps || [],
          },
        },
      },
    };
  } catch (error) {
    console.error("AgentOrchestrator Pipeline Error:", error);
    throw new Error(`Multi-Agent Pipeline Failure: ${error.message}`);
  }
};

module.exports = {
  orchestrateAnalysis,
  LogParserAgent,
  ThreatClassifierAgent,
  ThreatIntelligenceAgent,
  RemediationAgent,
};
