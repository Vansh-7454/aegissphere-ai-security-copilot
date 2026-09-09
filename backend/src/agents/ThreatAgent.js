/**
 * ThreatAgent.js
 * Multi-Agent Pipeline Gateway for AegisSphere.
 *
 * Directs incoming security analysis requests through the AgentOrchestrator
 * (LogParserAgent -> ThreatClassifierAgent -> ThreatIntelligenceAgent -> RemediationAgent).
 */

const { orchestrateAnalysis, LogParserAgent, ThreatClassifierAgent, ThreatIntelligenceAgent, RemediationAgent } = require("./AgentOrchestrator");

/**
 * Backward-compatible entry point for threat analysis
 * @param {string} logContent - Raw log content
 * @param {object} options - Optional parser metadata
 * @returns {Promise<object>}
 */
const analyzeThreat = async (logContent, options = {}) => {
  return orchestrateAnalysis(logContent, options);
};

module.exports = {
  analyzeThreat,
  orchestrateAnalysis,
  LogParserAgent,
  ThreatClassifierAgent,
  ThreatIntelligenceAgent,
  RemediationAgent,
};