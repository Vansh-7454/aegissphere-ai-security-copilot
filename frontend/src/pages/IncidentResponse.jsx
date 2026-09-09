import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/common/Layout';
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Clock,
  History,
  Search,
  Filter,
  UserCheck,
  ChevronDown,
  ChevronUp,
  FileEdit,
  PlusCircle,
  X,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/dashboard.css';

const IncidentResponse = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [notification, setNotification] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedHistory, setExpandedHistory] = useState({});
  const [activeActionModal, setActiveActionModal] = useState(null); // incidentId
  const [actionForm, setActionForm] = useState({ action: '', notes: '' });

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/incidents');
      if (res.data?.incidents) {
        setIncidents(res.data.incidents);
      }
    } catch (err) {
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const toggleHistory = (id) => {
    setExpandedHistory((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRecordAction = async (incidentId, displayId, actionName, actionNotes = '') => {
    if (!actionName || !actionName.trim()) {
      alert('Please enter an action name or select a response preset.');
      return;
    }

    try {
      setActionLoading(incidentId);
      const res = await api.post(`/incidents/${incidentId}/actions`, {
        action: actionName.trim(),
        notes: actionNotes.trim() || `Response action [${actionName.trim()}] recorded by SOC analyst.`,
      });

      if (res.data?.incident) {
        setIncidents((prev) =>
          prev.map((inc) => (inc._id === incidentId ? res.data.incident : inc))
        );
      }

      setNotification(`[ACTION RECORDED] "${actionName.trim()}" logged for incident ${displayId}.`);
      setActiveActionModal(null);
      setActionForm({ action: '', notes: '' });
      setTimeout(() => {
        setNotification(null);
      }, 4000);
    } catch (err) {
      console.error('Error recording response action:', err);
      alert(err.response?.data?.message || 'Failed to record response action.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (incidentId, newStatus) => {
    try {
      setActionLoading(incidentId);
      const res = await api.patch(`/incidents/${incidentId}`, {
        status: newStatus,
        actionName: `Status manually updated to ${newStatus}`,
      });

      if (res.data?.incident) {
        setIncidents((prev) =>
          prev.map((inc) => (inc._id === incidentId ? res.data.incident : inc))
        );
      }

      setNotification(`Incident status updated to ${newStatus}.`);
      setTimeout(() => {
        setNotification(null);
      }, 4000);
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.message || 'Failed to update incident status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteIncident = async (incidentId, displayId) => {
    if (!window.confirm(`Are you sure you want to delete incident ticket ${displayId}? Underlying threat and log telemetry will be preserved.`)) {
      return;
    }

    try {
      setActionLoading(incidentId);
      await api.delete(`/incidents/${incidentId}`);
      setIncidents((prev) => prev.filter((inc) => inc._id !== incidentId));
      setNotification(`Incident ${displayId} deleted cleanly.`);
      setTimeout(() => {
        setNotification(null);
      }, 4000);
    } catch (err) {
      console.error('Error deleting incident:', err);
      alert(err.response?.data?.message || 'Failed to delete incident.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredIncidents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return incidents.filter((inc) => {
      const matchStatus = statusFilter === 'All' || inc.status === statusFilter;
      const matchSeverity = severityFilter === 'All' || (inc.severity || '').toLowerCase() === severityFilter.toLowerCase();

      if (!q) return matchStatus && matchSeverity;

      const searchable = [
        inc.incidentId,
        inc.title,
        inc.description,
        inc.threatId?.threatType,
        inc.threatId?.sourceIp,
        inc.threatId?.mitreTechnique,
        inc.logId?.originalName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchStatus && matchSeverity && searchable.includes(q);
    });
  }, [incidents, statusFilter, severityFilter, searchTerm]);

  const getSeverityVariant = (sev) => {
    const s = (sev || '').toLowerCase();
    if (s === 'critical') return 'critical';
    if (s === 'high') return 'high';
    if (s === 'low') return 'low';
    return 'medium';
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'Just now';
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return timeStr;
    }
  };

  const activeCount = incidents.filter((i) => i.status !== 'Mitigated' && i.status !== 'Closed' && i.status !== 'Resolved').length;

  return (
    <Layout>
      <div className="soc-container">
        {/* Page Header */}
        <div className="soc-page-header">
          <div>
            <div className="soc-page-eyebrow">
              <AlertTriangle size={13} style={{ display: 'inline', marginRight: 4 }} />
              INCIDENT TRIAGE & CONTAINMENT
            </div>
            <h1 className="soc-page-title" style={{ fontSize: '24px', margin: 0 }}>
              Incident Response & Remediation
            </h1>
            <p className="soc-page-subtitle" style={{ fontSize: '13.5px', color: '#64748B', margin: '2px 0 0 0' }}>
              Execute containment playbooks, track incident lifecycles, and maintain real audit history for verified threats.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                background: activeCount > 0 ? '#FEE2E2' : '#DCFCE7',
                color: activeCount > 0 ? '#DC2626' : '#15803D',
                border: activeCount > 0 ? '1px solid #FECACA' : '1px solid #BBF7D0',
                padding: '4px 14px',
                borderRadius: '9999px',
                fontSize: '11.5px',
                fontWeight: 700,
              }}
            >
              {activeCount} Active Triage Cases
            </span>
          </div>
        </div>

        {/* Action / Notification Banner */}
        {notification && (
          <div
            style={{
              background: '#DCFCE7',
              border: '1px solid #BBF7D0',
              borderRadius: 'var(--radius-pill)',
              padding: '12px 18px',
              color: '#15803D',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{notification}</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card-soft)',
            borderRadius: 'var(--radius-xl)',
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Status Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {['All', 'Open', 'In Progress', 'Mitigated', 'Closed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`forensics-filter-btn ${statusFilter === st ? 'active' : ''}`}
                style={{ fontSize: '11.5px', padding: '4px 12px' }}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search & Severity Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="testlab-select"
              style={{ width: '130px', height: '34px', fontSize: '12px' }}
            >
              <option value="All">All Severity</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="aegis-input-field"
                style={{ paddingLeft: '32px', height: '34px', fontSize: '12px' }}
              />
            </div>
          </div>
        </div>

        {/* Real Response & Audit Mode Banner */}
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} style={{ color: '#2563EB', flexShrink: 0 }} />
          <span>
            <strong>SOC Response & Audit Mode:</strong> Record operator triage actions, update ticket lifecycle status, and maintain immutable audit history for verified threats.
          </span>
        </div>

        {/* Loading State */}
        {loading ? (
          <LoadingSpinner message="Fetching incident records from security pipeline..." />
        ) : filteredIncidents.length === 0 ? (
          <EmptyState
            title="No Security Incidents Found"
            description={
              incidents.length === 0
                ? "No critical or high-risk threats currently require active triage. Incidents will appear here when high-severity threats are detected."
                : "No incidents match your current status or search filters."
            }
            actionLabel="Upload Security Log"
            onAction={() => navigate('/logs')}
          />
        ) : (
          /* Incidents List */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredIncidents.map((inc) => {
              const displayId = inc.incidentId || `INC-${inc._id.slice(-4)}`;
              const sourceIp = inc.threatId?.sourceIp || 'Not available in log';
              const vector = inc.threatId?.mitreTechnique || inc.threatId?.threatType || 'Security Anomaly';
              const asset = inc.logId?.originalName || inc.logId?.filename || 'Security Telemetry Host';
              const isMitigated = inc.status === 'Mitigated' || inc.status === 'Closed' || inc.status === 'Resolved';
              const isHistoryOpen = expandedHistory[inc._id];
              const isActionOpen = activeActionModal === inc._id;

              return (
                <div key={inc._id} className="soc-table-card" style={{ padding: '22px' }}>
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#2563EB', fontWeight: 700 }}>
                        {displayId}
                      </span>
                      <Badge variant={getSeverityVariant(inc.severity)}>{inc.severity}</Badge>
                      
                      {/* Status Dropdown Selector */}
                      <select
                        value={inc.status}
                        onChange={(e) => handleStatusChange(inc._id, e.target.value)}
                        disabled={actionLoading === inc._id}
                        style={{
                          background: isMitigated ? '#DCFCE7' : '#FEE2E2',
                          color: isMitigated ? '#15803D' : '#DC2626',
                          border: isMitigated ? '1px solid #BBF7D0' : '1px solid #FECACA',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Investigating">Investigating</option>
                        <option value="Contained">Contained</option>
                        <option value="Mitigated">Mitigated</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Detected {formatTime(inc.createdAt)}
                      </span>
                      <button
                        onClick={() => handleDeleteIncident(inc._id, displayId)}
                        disabled={actionLoading === inc._id}
                        title="Delete Incident Ticket"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Trash2 size={14} style={{ color: '#EF4444' }} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)', margin: '8px 0 4px 0' }}>
                    {inc.title}
                  </h3>
                  {inc.description && (
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                      {inc.description}
                    </p>
                  )}

                  {/* Grounded Attributes Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '10px',
                      margin: '12px 0',
                    }}
                  >
                    <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                      <span style={{ fontSize: '10.5px', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Source IP</span>
                      <strong style={{ fontSize: '12.5px', fontFamily: 'var(--font-mono)', color: '#2563EB' }}>{sourceIp}</strong>
                    </div>

                    <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                      <span style={{ fontSize: '10.5px', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Attack Vector / MITRE</span>
                      <strong style={{ fontSize: '12.5px', color: '#0F172A' }}>{vector}</strong>
                    </div>

                    <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                      <span style={{ fontSize: '10.5px', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Associated Log Asset</span>
                      <strong style={{ fontSize: '12.5px', color: '#0F172A' }}>{asset}</strong>
                    </div>

                    <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                      <span style={{ fontSize: '10.5px', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Assigned Operator</span>
                      <strong style={{ fontSize: '12.5px', color: '#0F172A' }}>
                        {inc.assignedTo ? (typeof inc.assignedTo === 'object' ? inc.assignedTo.name || inc.assignedTo.email : 'Assigned') : 'Unassigned'}
                      </strong>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => {
                          if (activeActionModal === inc._id) {
                            setActiveActionModal(null);
                          } else {
                            setActiveActionModal(inc._id);
                            setActionForm({ action: '', notes: '' });
                          }
                        }}
                        disabled={actionLoading === inc._id}
                        className="aegis-btn aegis-btn-primary aegis-btn-sm"
                        style={{ fontSize: '11.5px', padding: '4px 12px' }}
                      >
                        <PlusCircle size={12} />
                        {isActionOpen ? 'Close Action Form' : 'Log Response Action'}
                      </button>
                    </div>

                    {/* Action History Toggle Button */}
                    <button
                      onClick={() => toggleHistory(inc._id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#6366F1',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <History size={13} />
                      <span>Audit Trail ({(inc.actionHistory || []).length})</span>
                      {isHistoryOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </div>

                  {/* Inline Response Action Logger Form */}
                  {isActionOpen && (
                    <div style={{ marginTop: '14px', background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '8px' }}>
                        Record Incident Response Action
                      </span>
                      
                      {/* Presets */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        {[
                          'Triage Assessment Completed',
                          'Host Network Isolation Logged',
                          'Firewall Rule Requested',
                          'Target Account Flagged',
                          'Remediation Playbook Applied',
                        ].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setActionForm((prev) => ({ ...prev, action: preset }))}
                            style={{
                              background: actionForm.action === preset ? '#DBEAFE' : '#FFFFFF',
                              color: actionForm.action === preset ? '#1E40AF' : '#475569',
                              border: actionForm.action === preset ? '1px solid #93C5FD' : '1px solid #CBD5E1',
                              borderRadius: '9999px',
                              padding: '2px 10px',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="Action summary (e.g. Verified IOC & blocked subnet)..."
                          value={actionForm.action}
                          onChange={(e) => setActionForm({ ...actionForm, action: e.target.value })}
                          className="aegis-input-field"
                          style={{ height: '34px', fontSize: '12px' }}
                        />
                        <input
                          type="text"
                          placeholder="Additional notes / reference ticket ID (optional)..."
                          value={actionForm.notes}
                          onChange={(e) => setActionForm({ ...actionForm, notes: e.target.value })}
                          className="aegis-input-field"
                          style={{ height: '34px', fontSize: '12px' }}
                        />
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start', marginTop: '2px' }}>
                          <button
                            onClick={() => handleRecordAction(inc._id, displayId, actionForm.action, actionForm.notes)}
                            disabled={actionLoading === inc._id || !actionForm.action.trim()}
                            className="aegis-btn aegis-btn-primary aegis-btn-sm"
                            style={{ fontSize: '11.5px', padding: '4px 14px' }}
                          >
                            Save to Audit Trail
                          </button>
                          <button
                            onClick={() => setActiveActionModal(null)}
                            className="aegis-btn aegis-btn-secondary aegis-btn-sm"
                            style={{ fontSize: '11.5px', padding: '4px 10px' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Expandable Action Audit Trail */}
                  {isHistoryOpen && (
                    <div style={{ marginTop: '14px', background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                        Incident Response History & Audit Trail
                      </span>
                      {(inc.actionHistory || []).length === 0 ? (
                        <span style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>No containment actions recorded yet.</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {inc.actionHistory.map((act, aIdx) => (
                            <div
                              key={aIdx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '12px',
                                background: '#FFFFFF',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid #E2E8F0',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle2 size={13} style={{ color: '#15803D' }} />
                                <strong style={{ color: '#0F172A' }}>{act.action}</strong>
                                <span style={{ color: '#64748B', fontSize: '11px' }}>({act.status || 'Recorded'})</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '11px' }}>
                                <span>by {act.performedByName || 'SOC Analyst'}</span>
                                <span>{formatTime(act.timestamp)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default IncidentResponse;
