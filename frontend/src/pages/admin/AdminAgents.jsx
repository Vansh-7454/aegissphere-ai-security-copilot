import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';
import {
  Cpu,
  RefreshCw,
  CheckCircle2,
  Layers,
  FileCode2,
  ShieldCheck,
  BrainCircuit,
  Wrench,
  Terminal,
} from 'lucide-react';
import '../../styles/admin.css';

const AdminAgents = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAgentTelemetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/agents');
      if (response.data?.success) {
        setData(response.data);
      }
    } catch (err) {
      console.error('Failed to load agent metrics:', err);
      setError(err.response?.data?.message || 'Failed to fetch agent telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentTelemetry();
  }, []);

  const pipeline = data?.pipeline || {};
  const agents = data?.agents || [];

  const getAgentIcon = (id) => {
    switch (id) {
      case 'AGENT-01': return <FileCode2 size={20} style={{ color: '#0284C7' }} />;
      case 'AGENT-02': return <ShieldCheck size={20} style={{ color: '#DC2626' }} />;
      case 'AGENT-03': return <BrainCircuit size={20} style={{ color: '#0D9488' }} />;
      case 'AGENT-04': return <Wrench size={20} style={{ color: '#EA580C' }} />;
      default: return <Cpu size={20} style={{ color: '#0284C7' }} />;
    }
  };

  const getAgentTheme = (id) => {
    switch (id) {
      case 'AGENT-01': return { color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' };
      case 'AGENT-02': return { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' };
      case 'AGENT-03': return { color: '#0D9488', bg: '#F0FDFA', border: '#CCFBF1' };
      case 'AGENT-04': return { color: '#EA580C', bg: '#FFF7ED', border: '#FFEDD5' };
      default: return { color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' };
    }
  };

  return (
    <AdminLayout>
      <div className="admin-card" style={{ marginBottom: '20px' }}>
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              <Cpu size={20} style={{ color: '#0284C7' }} />
              Multi-Agent Architecture & Pipeline Monitoring
            </h2>
            <p className="admin-card-desc">
              Deterministic 4-stage multi-agent telemetry backed by actual database execution counts
            </p>
          </div>

          <button
            onClick={fetchAgentTelemetry}
            disabled={loading}
            className="aegis-btn aegis-btn-secondary aegis-btn-sm"
          >
            <RefreshCw size={13} className={loading ? 'aegis-btn-spinner' : ''} />
            Refresh Pipeline
          </button>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: '#DC2626', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* Pipeline Summary Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: '#F8FCFE', border: '1px solid #BAE6FD', padding: '14px 16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>ORCHESTRATOR</span>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
              {pipeline.orchestrator || 'AgentOrchestrator.js'}
            </div>
            <span style={{ fontSize: '11.5px', color: '#15803D', fontWeight: 700 }}>● Synchronized Mesh</span>
          </div>

          <div style={{ background: '#F8FCFE', border: '1px solid #BAE6FD', padding: '14px 16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>PROCESSED LOG STREAMS</span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0284C7', marginTop: '2px' }}>
              {pipeline.totalProcessedLogs || 0}
            </div>
          </div>

          <div style={{ background: '#F8FCFE', border: '1px solid #BAE6FD', padding: '14px 16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>CLASSIFIED THREATS</span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#DC2626', marginTop: '2px' }}>
              {pipeline.totalThreatsIdentified || 0}
            </div>
          </div>

          <div style={{ background: '#F8FCFE', border: '1px solid #BAE6FD', padding: '14px 16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>PLAYBOOKS AUTOMATED</span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#EA580C', marginTop: '2px' }}>
              {pipeline.incidentsAutomated || 0}
            </div>
          </div>
        </div>

        {/* 4 Specialized Agent Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px' }}>
          {agents.map((agent) => {
            const theme = getAgentTheme(agent.id);
            return (
              <div
                key={agent.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(186, 230, 253, 0.85)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.04)',
                }}
              >
                <div>
                  {/* Top Row: Stage Tag & Status Badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginBottom: '12px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: theme.color,
                        fontWeight: 700,
                        background: theme.bg,
                        border: `1px solid ${theme.border}`,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {agent.stage}
                    </span>
                    <span
                      className="admin-badge admin-badge-active"
                      style={{
                        flexShrink: 0,
                        padding: '2px 8px',
                        fontSize: '11px',
                      }}
                    >
                      <CheckCircle2 size={11} /> {agent.status}
                    </span>
                  </div>

                  {/* Agent Icon + Title Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: 'var(--radius-md)',
                        background: theme.bg,
                        border: `1px solid ${theme.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {getAgentIcon(agent.id)}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h3
                        style={{
                          fontSize: '15px',
                          fontWeight: 800,
                          color: '#0F172A',
                          margin: 0,
                          lineHeight: 1.3,
                          wordBreak: 'break-word',
                        }}
                      >
                        {agent.name}
                      </h3>
                    </div>
                  </div>

                  <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.5', margin: '0 0 12px 0' }}>
                    {agent.description}
                  </p>

                  <div style={{ background: '#F8FCFE', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-sm)', padding: '10px', fontSize: '12px' }}>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>Core Role:</span>
                    <div style={{ color: '#64748B', marginTop: '2px' }}>{agent.role}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#64748B' }}>Total Pipeline Passes:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0284C7' }}>
                    {agent.totalExecutions || 0}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAgents;
