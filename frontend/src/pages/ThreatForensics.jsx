import React, { useEffect, useMemo, useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Eye,
  X,
  AlertTriangle,
  Clock,
  Globe,
  CheckCircle,
  Lightbulb,
  FileText,
  Bookmark,
  Activity,
  CheckCircle2,
} from 'lucide-react';

import api from '../services/api';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import { Link } from 'react-router-dom';
import '../styles/threatForensics.css';
import '../styles/dashboard.css';

const ThreatForensics = () => {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNotice, setAiNotice] = useState('');

  const handleRunAiAnalysis = async (threatId, isRefresh = false) => {
    if (!threatId) return;
    try {
      setAiLoading(true);
      setAiNotice('');
      const res = await api.post(`/ai/analyze-threat/${threatId}${isRefresh ? '?refresh=true' : ''}`);
      if (res.data?.aiAvailable && res.data?.aiAnalysis) {
        setSelectedThreat((prev) => ({
          ...prev,
          aiAnalysis: res.data.aiAnalysis,
        }));
        // Update local threats list
        setThreats((prevList) =>
          prevList.map((t) => (t._id === threatId || t.id === threatId ? { ...t, aiAnalysis: res.data.aiAnalysis } : t))
        );
      } else if (!res.data?.aiAvailable) {
        setAiNotice(res.data?.reason || 'AI analysis is currently unavailable.');
      }
    } catch (err) {
      console.error('Error running AI analysis:', err);
      setAiNotice(err.response?.data?.message || 'Unable to connect to AI analysis service.');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    const fetchThreats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard');
        const list = res.data?.threats || res.data?.recentThreats || [];
        setThreats(list);
      } catch (error) {
        console.error('Error fetching threats:', error);
        setThreats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchThreats();
  }, []);

  const filteredThreats = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return threats.filter((threat) => {
      const severityMatch =
        selectedSeverity === 'All' ||
        (threat.severity || '').toLowerCase() === selectedSeverity.toLowerCase();

      if (!query) return severityMatch;

      const searchableText = [
        threat.threatType,
        threat.attackType,
        threat.sourceIp,
        threat.description,
        threat.recommendation,
        threat.mitreTechnique,
        threat.confidenceReason,
        threat.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return severityMatch && searchableText.includes(query);
    });
  }, [threats, selectedSeverity, searchTerm]);

  const getSeverityVariant = (sev) => {
    const s = (sev || '').toLowerCase();
    if (s === 'critical') return 'critical';
    if (s === 'high') return 'high';
    if (s === 'low') return 'low';
    return 'medium';
  };

  const formatDate = (date) => {
    if (!date) return 'Recently';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return String(date);
    return d.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <div className="forensics-page">
        {/* Page Header */}
        <div className="soc-page-header">
          <div>
            <div className="soc-page-eyebrow">
              <ShieldAlert size={13} style={{ display: 'inline', marginRight: 4 }} />
              THREAT FORENSICS & IOC INSPECTION
            </div>
            <h1 className="soc-page-title" style={{ fontSize: '24px', margin: 0 }}>
              Investigate Detected Threats
            </h1>
            <p className="soc-page-subtitle" style={{ fontSize: '13.5px', color: '#64748B', margin: '2px 0 0 0' }}>
              Review correlated threats by examining raw captures, matched signatures, and MITRE ATT&CK technique tags.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                background: '#DBEAFE',
                color: '#1E40AF',
                border: '1px solid #BFDBFE',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              {threats.length} Total Events Recorded
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="forensics-filter-bar">
          <div className="forensics-filter-group">
            {['All', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
              <button
                key={sev}
                className={`forensics-filter-btn ${selectedSeverity === sev ? 'active' : ''}`}
                onClick={() => setSelectedSeverity(sev)}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="soc-search-container" style={{ width: '280px' }}>
            <Search size={14} className="soc-search-icon" />
            <input
              type="text"
              className="soc-search-input"
              placeholder="Search by threat, IP, or CVE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Main Table Card */}
        <div className="soc-table-card">
          {loading ? (
            <LoadingSpinner message="Querying forensic threat store..." />
          ) : threats.length === 0 ? (
            <EmptyState
              title="No Threats Detected Yet"
              description="Upload security logs in the Ingestion Gateway or generate a controlled test scenario in the Security Test Lab to populate threat forensics."
              action={
                <Link to="/logs" className="aegis-btn aegis-btn-primary aegis-btn-sm">
                  Upload Security Logs
                </Link>
              }
            />
          ) : filteredThreats.length === 0 ? (
            <EmptyState
              title="No Threats Matched Filter"
              description="Adjust your search criteria or severity filters to view other recorded security events."
            />
          ) : (
            <div className="soc-table-container">
              <table className="soc-table">
                <thead>
                  <tr>
                    <th>Threat / Attack Vector</th>
                    <th>Severity</th>
                    <th>Source IP</th>
                    <th>Confidence</th>
                    <th>Detected Time</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredThreats.map((threat, idx) => (
                    <tr key={threat._id || threat.id || idx}>
                      <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                        {threat.threatType || threat.attackType || 'Security Anomaly'}
                      </td>
                      <td>
                        <Badge variant={getSeverityVariant(threat.severity)}>
                          {threat.severity || 'Medium'}
                        </Badge>
                      </td>
                      <td className="soc-ip-cell">
                        {threat.sourceIp ? (
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{threat.sourceIp}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '11.5px', fontStyle: 'italic' }}>Not available in log</span>
                        )}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: '#2563EB' }}>
                        {threat.confidence !== undefined ? `${threat.confidence}%` : 'N/A'}
                      </td>
                      <td className="soc-time-cell">
                        {formatDate(threat.createdAt)}
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '3px 9px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background:
                              (threat.status || '').toLowerCase() === 'resolved' ||
                              (threat.status || '').toLowerCase() === 'mitigated'
                                ? '#DCFCE7'
                                : (threat.status || '').toLowerCase() === 'investigating'
                                ? '#FEF3C7'
                                : '#FEE2E2',
                            color:
                              (threat.status || '').toLowerCase() === 'resolved' ||
                              (threat.status || '').toLowerCase() === 'mitigated'
                                ? '#15803D'
                                : (threat.status || '').toLowerCase() === 'investigating'
                                ? '#D97706'
                                : '#DC2626',
                          }}
                        >
                          {threat.status || 'Active'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedThreat(threat)}
                          className="aegis-btn aegis-btn-ghost aegis-btn-sm"
                          style={{ color: '#2563EB', fontWeight: 600 }}
                        >
                          Investigate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Threat Investigation Detail Drawer / Modal */}
        {selectedThreat && (
          <div className="forensics-modal-overlay" onClick={() => setSelectedThreat(null)}>
            <div className="forensics-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="forensics-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldAlert size={22} style={{ color: selectedThreat.severity === 'Critical' ? '#DC2626' : '#2563EB' }} />
                  <div>
                    <h3 className="forensics-modal-title" style={{ margin: 0 }}>
                      {selectedThreat.threatType || 'Forensic Investigation'}
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>
                      Event Record ID: {selectedThreat._id || selectedThreat.id}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedThreat(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="forensics-modal-grid">
                <div className="forensics-modal-cell">
                  <span>Severity Classification</span>
                  <div>
                    <Badge variant={getSeverityVariant(selectedThreat.severity)}>
                      {selectedThreat.severity} Risk
                    </Badge>
                  </div>
                </div>

                <div className="forensics-modal-cell">
                  <span>Source IP Address</span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: '#2563EB' }}>
                    {selectedThreat.sourceIp || 'Not available in log'}
                  </strong>
                </div>

                <div className="forensics-modal-cell">
                  <span>Detection Confidence</span>
                  <strong>{selectedThreat.confidence !== undefined ? `${selectedThreat.confidence}%` : 'N/A'} (Calculated)</strong>
                </div>

                <div className="forensics-modal-cell">
                  <span>MITRE ATT&CK Mapping</span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: '#6366F1' }}>
                    {selectedThreat.mitreTechnique || 'T1059 - Execution'}
                  </strong>
                </div>
              </div>

              {selectedThreat.logId && (
                <div style={{ background: '#FFFFFF', padding: '14px 16px', borderRadius: '12px', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={18} style={{ color: '#2563EB' }} />
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Linked Log File</span>
                    <strong style={{ fontSize: '13px', color: '#0F172A' }}>
                      {typeof selectedThreat.logId === 'object' ? selectedThreat.logId.originalName || selectedThreat.logId.filename : 'Linked Ingested Log'}
                    </strong>
                  </div>
                </div>
              )}

              {/* Confidence Calculation Explanation */}
              {selectedThreat.confidenceReason && (
                <div style={{ background: '#EFF6FF', padding: '14px 16px', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                  <span style={{ fontSize: '11px', color: '#1E40AF', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Confidence Scoring Breakdown
                  </span>
                  <p style={{ fontSize: '12.5px', color: '#1E3A8A', lineHeight: '1.5', margin: 0 }}>
                    {selectedThreat.confidenceReason}
                  </p>
                </div>
              )}

              {/* Matched Evidence Indicators List */}
              {selectedThreat.matchedIndicators && selectedThreat.matchedIndicators.length > 0 && (
                <div style={{ background: '#FFFFFF', padding: '14px 16px', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    Observed Evidence Indicators
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedThreat.matchedIndicators.map((ind, iIdx) => (
                      <div key={iIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#0F172A' }}>
                        <CheckCircle2 size={13} style={{ color: '#2563EB', flexShrink: 0 }} />
                        <span>{ind}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Observed Attack Description
                </span>
                <p style={{ fontSize: '13px', color: '#1E293B', lineHeight: '1.6', margin: 0 }}>
                  {selectedThreat.description || 'Heuristic rules identified anomalous signatures matching known attack patterns.'}
                </p>
              </div>

              <div style={{ background: '#DCFCE7', padding: '16px', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Recommended Containment Action
                </span>
                <p style={{ fontSize: '13px', color: '#14532D', lineHeight: '1.6', margin: 0 }}>
                  {selectedThreat.recommendation || 'Apply edge firewall blocking rules and review host access credentials.'}
                </p>
              </div>

              {/* Google Gemini AI-Assisted Security Analysis Section */}
              <div style={{ background: '#FAF5FF', padding: '18px', borderRadius: '14px', border: '1.5px solid #DDD6FE', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Lightbulb size={16} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '13.5px', color: '#5B21B6', display: 'block' }}>
                        AI-Assisted Security Analysis
                      </strong>
                      <span style={{ fontSize: '11px', color: '#7C3AED' }}>
                        Contextual reasoning & SOC investigation guidance powered by Google Gemini
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRunAiAnalysis(selectedThreat._id || selectedThreat.id, Boolean(selectedThreat.aiAnalysis?.summary))}
                    disabled={aiLoading}
                    className="aegis-btn aegis-btn-sm"
                    style={{
                      background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                      color: '#FFFFFF',
                      fontSize: '11.5px',
                      padding: '4px 14px',
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
                    }}
                  >
                    {aiLoading ? (
                      <>
                        <span className="aegis-btn-spinner" />
                        Analyzing...
                      </>
                    ) : selectedThreat.aiAnalysis?.summary ? (
                      'Regenerate AI Analysis'
                    ) : (
                      'Generate AI Analysis'
                    )}
                  </button>
                </div>

                {/* AI Error / Unavailable Notice */}
                {aiNotice && (
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', color: '#92400E', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={14} style={{ color: '#D97706', flexShrink: 0 }} />
                    <span>{aiNotice}</span>
                  </div>
                )}

                {/* Render AI Analysis Content if Present */}
                {selectedThreat.aiAnalysis?.summary ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Executive Summary */}
                    <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E9D5FF' }}>
                      <span style={{ fontSize: '11px', color: '#6B21A8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                        Executive Summary
                      </span>
                      <p style={{ fontSize: '12.5px', color: '#1E293B', lineHeight: '1.55', margin: 0 }}>
                        {selectedThreat.aiAnalysis.summary}
                      </p>
                    </div>

                    {/* Why Suspicious & Observed Evidence Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                      {/* Why Suspicious */}
                      <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E9D5FF' }}>
                        <span style={{ fontSize: '11px', color: '#6B21A8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                          Why This Is Suspicious
                        </span>
                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>
                          {(selectedThreat.aiAnalysis.whySuspicious || []).map((reason, rIdx) => (
                            <li key={rIdx} style={{ marginBottom: '4px' }}>{reason}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Observed Evidence */}
                      <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E9D5FF' }}>
                        <span style={{ fontSize: '11px', color: '#6B21A8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                          Observed Telemetry Facts
                        </span>
                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>
                          {(selectedThreat.aiAnalysis.observedEvidence || []).map((ev, eIdx) => (
                            <li key={eIdx} style={{ marginBottom: '4px' }}>{ev}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Investigation Steps Checklist */}
                    {selectedThreat.aiAnalysis.investigationSteps && selectedThreat.aiAnalysis.investigationSteps.length > 0 && (
                      <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E9D5FF' }}>
                        <span style={{ fontSize: '11px', color: '#6B21A8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                          Recommended SOC Investigation Steps
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {selectedThreat.aiAnalysis.investigationSteps.map((step, sIdx) => (
                            <div key={sIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#1E293B' }}>
                              <span style={{ color: '#7C3AED', fontWeight: 700, fontSize: '11px', minWidth: '16px' }}>{sIdx + 1}.</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Remediation & Risk Context */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                      {/* Safe Remediation */}
                      <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E9D5FF' }}>
                        <span style={{ fontSize: '11px', color: '#6B21A8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                          Contextual Remediation Suggestions
                        </span>
                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>
                          {(selectedThreat.aiAnalysis.remediation || []).map((rem, rmIdx) => (
                            <li key={rmIdx} style={{ marginBottom: '4px' }}>{rem}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Risk & Uncertainty */}
                      <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E9D5FF' }}>
                        <span style={{ fontSize: '11px', color: '#6B21A8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                          Risk Context & Data Constraints
                        </span>
                        <p style={{ fontSize: '12px', color: '#334155', margin: '0 0 6px 0', lineHeight: '1.45' }}>
                          <strong>Impact:</strong> {selectedThreat.aiAnalysis.riskContext || 'Standard anomaly triage.'}
                        </p>
                        {selectedThreat.aiAnalysis.uncertainty && (
                          <p style={{ fontSize: '11.5px', color: '#64748B', margin: 0, fontStyle: 'italic', lineHeight: '1.4' }}>
                            <strong>Telemetry Limitations:</strong> {selectedThreat.aiAnalysis.uncertainty}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#7C3AED', paddingTop: '4px' }}>
                      <span>Model: {selectedThreat.aiAnalysis.model || 'gemini-2.5-flash'} | Confidence: {selectedThreat.aiAnalysis.confidenceInAnalysis || 'medium'}</span>
                      {selectedThreat.aiAnalysis.generatedAt && (
                        <span>Evaluated: {formatDate(selectedThreat.aiAnalysis.generatedAt)}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  !aiLoading && (
                    <div style={{ textAlign: 'center', padding: '12px', color: '#6B21A8', fontSize: '12px' }}>
                      Click "Generate AI Analysis" to request deep contextual reasoning from Google Gemini.
                    </div>
                  )
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Logged: {formatDate(selectedThreat.createdAt)}
                </span>
                <button
                  onClick={() => setSelectedThreat(null)}
                  className="aegis-btn aegis-btn-primary aegis-btn-sm"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ThreatForensics;