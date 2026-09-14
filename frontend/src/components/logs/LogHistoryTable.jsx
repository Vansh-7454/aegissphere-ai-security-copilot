import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../common/EmptyState';
import Badge from '../common/Badge';
import Button from '../common/Button';
import {
  FileText,
  Search,
  Eye,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  X,
  Clock,
  ChevronRight,
} from 'lucide-react';
import './LogHistoryTable.css';

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const LogHistoryTable = ({ logs = [], onDeleteLog, loading = false }) => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('all'); // 'all' | 'threats' | 'clean'
  const [severityFilter, setSeverityFilter] = useState('All'); // 'All' | 'Critical' | 'High' | 'Medium' | 'Low'
  const [selectedLog, setSelectedLog] = useState(null);

  // Statistics counters
  const totalCount = logs.length;
  const threatCount = logs.filter((l) => (l.threatCount && l.threatCount > 0) || l.analysis).length;
  const cleanCount = totalCount - threatCount;

  // Filter logs based on search and selected filters
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const isThreat = (log.threatCount && log.threatCount > 0) || !!log.analysis;
      const severity = log.analysis?.severity || 'Clean';

      // Verdict tab filter
      if (verdictFilter === 'threats' && !isThreat) return false;
      if (verdictFilter === 'clean' && isThreat) return false;

      // Severity dropdown filter
      if (severityFilter !== 'All') {
        if (!isThreat || severity.toLowerCase() !== severityFilter.toLowerCase()) {
          return false;
        }
      }

      // Search term
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();

      const nameMatch = (log.originalName || log.filename || '').toLowerCase().includes(term);
      const threatMatch = (log.analysis?.threatType || '').toLowerCase().includes(term);
      const mitreMatch = (log.analysis?.mitreTechnique || '').toLowerCase().includes(term);
      const ipMatch = (log.analysis?.sourceIp || '').toLowerCase().includes(term);
      const formatMatch = (log.fileFormat || '').toLowerCase().includes(term);

      return nameMatch || threatMatch || mitreMatch || ipMatch || formatMatch;
    });
  }, [logs, verdictFilter, severityFilter, searchTerm]);

  return (
    <div className="log-history-card">
      {/* Table Header & Counters */}
      <div className="log-history-header">
        <div className="log-history-title-group">
          <h3 className="log-history-title">
            <FileText size={18} style={{ color: 'var(--accent-primary)' }} />
            Ingested Log Records & Audit Trail
          </h3>
          <p className="log-history-subtitle">
            Catalog of historical security files parsed and evaluated by the multi-agent detection engine
          </p>
        </div>

        <div className="log-history-badges">
          <span className="log-stat-badge total">Total Logs: {totalCount}</span>
          <span className="log-stat-badge threats">Threats: {threatCount}</span>
          <span className="log-stat-badge clean">Clean: {cleanCount}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="log-history-controls">
        <div className="log-search-group">
          <Search size={14} className="log-search-icon" />
          <input
            type="text"
            className="log-search-input"
            placeholder="Search filename, threat, IP, or format..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="log-filter-actions">
          <button
            type="button"
            className={`log-filter-pill ${verdictFilter === 'all' ? 'active' : ''}`}
            onClick={() => setVerdictFilter('all')}
          >
            All Logs ({totalCount})
          </button>
          <button
            type="button"
            className={`log-filter-pill ${verdictFilter === 'threats' ? 'active' : ''}`}
            onClick={() => setVerdictFilter('threats')}
          >
            Threats ({threatCount})
          </button>
          <button
            type="button"
            className={`log-filter-pill ${verdictFilter === 'clean' ? 'active' : ''}`}
            onClick={() => setVerdictFilter('clean')}
          >
            Clean Telemetry ({cleanCount})
          </button>

          <select
            className="log-select-filter"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Log Data Table */}
      {filteredLogs.length > 0 ? (
        <div className="log-table-wrapper">
          <table className="log-table">
            <thead>
              <tr>
                <th>Log File & Format</th>
                <th>Ingested Timestamp</th>
                <th>File Size</th>
                <th>Security Outcome</th>
                <th>Confidence</th>
                <th>MITRE ATT&CK</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const isThreat = (log.threatCount && log.threatCount > 0) || !!log.analysis;
                const analysis = log.analysis;
                const severity = analysis?.severity || 'Low';
                const severityClass = isThreat
                  ? `threat-${severity.toLowerCase()}`
                  : 'clean';

                return (
                  <tr key={log._id}>
                    {/* File Name & Format */}
                    <td>
                      <div className="log-file-cell">
                        <div className="log-file-thumb">
                          <FileText size={16} />
                        </div>
                        <div>
                          <div className="log-file-primary" title={log.originalName || log.filename}>
                            {log.originalName || log.filename}
                          </div>
                          <span className="log-file-format-tag">
                            {(log.fileFormat || 'LOG').toUpperCase().replace('.', '')}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                        <span>{formatDate(log.createdAt)}</span>
                      </div>
                    </td>

                    {/* File Size */}
                    <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                      {formatFileSize(log.fileSize)}
                    </td>

                    {/* Security Verdict */}
                    <td>
                      {isThreat ? (
                        <span className={`log-verdict-tag ${severityClass}`}>
                          <ShieldAlert size={12} />
                          <span>{analysis?.threatType || 'Threat Detected'}</span>
                          <span style={{ opacity: 0.8 }}>({severity})</span>
                        </span>
                      ) : (
                        <span className="log-verdict-tag clean">
                          <ShieldCheck size={12} />
                          <span>Verified Clean</span>
                        </span>
                      )}
                    </td>

                    {/* Confidence Score */}
                    <td>
                      {isThreat && analysis?.confidence !== undefined ? (
                        <span style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '12.5px' }}>
                          {analysis.confidence}%
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>100% (Clean)</span>
                      )}
                    </td>

                    {/* MITRE Technique */}
                    <td>
                      {isThreat && analysis?.mitreTechnique ? (
                        <span className="log-mitre-code" title={analysis.mitreTechnique}>
                          {analysis.mitreTechnique}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="log-row-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="log-action-btn"
                          title="View Ingestion & Threat Details"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye size={14} />
                        </button>

                        {isThreat && (
                          <button
                            type="button"
                            className="log-action-btn"
                            title="Inspect in Threat Forensics Console"
                            onClick={() => navigate('/threats')}
                          >
                            <ExternalLink size={13} />
                          </button>
                        )}

                        <button
                          type="button"
                          className="log-action-btn delete"
                          title="Remove Log Audit Record"
                          onClick={() => onDeleteLog && onDeleteLog(log._id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title={logs.length === 0 ? 'No Log Files Ingested Yet' : 'No Logs Matching Filter'}
          description={
            logs.length === 0
              ? 'Upload your first server security log or select a rapid test preset above to trigger the multi-agent detection pipeline.'
              : 'Try clearing the search query or adjusting verdict and severity filters.'
          }
          icon={FileText}
          action={
            (searchTerm || verdictFilter !== 'all' || severityFilter !== 'All') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setVerdictFilter('all');
                  setSeverityFilter('All');
                }}
              >
                Reset Filters
              </Button>
            )
          }
        />
      )}

      {/* Drilldown Modal */}
      {selectedLog && (
        <div className="log-modal-backdrop" onClick={() => setSelectedLog(null)}>
          <div className="log-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="log-modal-header">
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  INGESTION AUDIT DRILLDOWN
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                  {selectedLog.originalName || selectedLog.filename}
                </h3>
              </div>
              <button
                type="button"
                className="log-action-btn"
                onClick={() => setSelectedLog(null)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Ingestion Overview Grid */}
            <div className="log-modal-grid">
              <div className="log-modal-card-cell">
                <span className="log-modal-label">Ingested Timestamp</span>
                <span className="log-modal-val">{formatDate(selectedLog.createdAt)}</span>
              </div>
              <div className="log-modal-card-cell">
                <span className="log-modal-label">Payload Size & Format</span>
                <span className="log-modal-val">
                  {formatFileSize(selectedLog.fileSize)} ({selectedLog.fileFormat || '.log'})
                </span>
              </div>
              <div className="log-modal-card-cell">
                <span className="log-modal-label">Detection Status</span>
                <span className="log-modal-val">
                  {selectedLog.analysis ? `${selectedLog.analysis.severity} Severity Threat` : 'Verified Clean'}
                </span>
              </div>
              <div className="log-modal-card-cell">
                <span className="log-modal-label">Storage Handle</span>
                <span className="log-modal-val" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  {selectedLog.filename}
                </span>
              </div>
            </div>

            {/* Deep Threat Forensic Analysis if Present */}
            {selectedLog.analysis ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldAlert size={16} style={{ color: '#DC2626' }} />
                  Multi-Agent Forensic Evidence
                </div>

                <div
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#991B1B' }}>
                      {selectedLog.analysis.threatType}
                    </span>
                    <Badge variant={selectedLog.analysis.severity.toLowerCase()}>
                      {selectedLog.analysis.severity}
                    </Badge>
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#7F1D1D', margin: 0, lineHeight: 1.5 }}>
                    {selectedLog.analysis.description}
                  </p>
                </div>

                <div className="log-modal-grid">
                  <div className="log-modal-card-cell">
                    <span className="log-modal-label">MITRE ATT&CK Technique</span>
                    <span className="log-modal-val">{selectedLog.analysis.mitreTechnique || 'T1059'}</span>
                  </div>
                  <div className="log-modal-card-cell">
                    <span className="log-modal-label">Confidence Score</span>
                    <span className="log-modal-val" style={{ color: 'var(--accent-primary)' }}>
                      {selectedLog.analysis.confidence}% Calculated
                    </span>
                  </div>
                  {selectedLog.analysis.sourceIp && (
                    <div className="log-modal-card-cell">
                      <span className="log-modal-label">Attacker Source IP</span>
                      <span className="log-modal-val" style={{ fontFamily: 'var(--font-mono)' }}>
                        {selectedLog.analysis.sourceIp}
                      </span>
                    </div>
                  )}
                  {selectedLog.analysis.confidenceReason && (
                    <div className="log-modal-card-cell" style={{ gridColumn: 'span 2' }}>
                      <span className="log-modal-label">Confidence Evaluation</span>
                      <span className="log-modal-val" style={{ fontSize: '12.5px', fontWeight: 500 }}>
                        {selectedLog.analysis.confidenceReason}
                      </span>
                    </div>
                  )}
                </div>

                {/* Matched Indicators (IoCs) */}
                {selectedLog.analysis.matchedIndicators && selectedLog.analysis.matchedIndicators.length > 0 && (
                  <div>
                    <span className="log-modal-label" style={{ marginBottom: 6, display: 'block' }}>
                      Extracted Indicators of Compromise (IoCs)
                    </span>
                    <div>
                      {selectedLog.analysis.matchedIndicators.map((ioc, idx) => (
                        <span key={idx} className="log-ioc-chip">
                          {ioc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Remediation Guidance */}
                {selectedLog.analysis.recommendation && (
                  <div
                    style={{
                      background: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 16px',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#15803D', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                      Remediation Agent Advisory
                    </span>
                    <p style={{ fontSize: '12.5px', color: '#166534', margin: 0, lineHeight: 1.5 }}>
                      {selectedLog.analysis.recommendation}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <ShieldCheck size={28} style={{ color: '#16A34A', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#15803D' }}>
                    Zero Anomalies or Attack Signatures Detected
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#166534', marginTop: 2 }}>
                    This log record passed all multi-agent heuristics with 0 detected threats.
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: 6 }}>
              {selectedLog.analysis && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedLog(null);
                    navigate('/threats');
                  }}
                  rightIcon={<ChevronRight size={14} />}
                >
                  Open in Threat Forensics
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogHistoryTable;
