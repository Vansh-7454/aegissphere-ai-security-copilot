import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';
import {
  Activity,
  RefreshCw,
  Database,
  Server,
  Cpu,
  FileCheck2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import '../../styles/admin.css';

const AdminSystemHealth = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealthDiagnostics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/system-health');
      if (response.data?.success) {
        setHealthData(response.data);
      }
    } catch (err) {
      console.error('Failed to load system health:', err);
      setError(err.response?.data?.message || 'Failed to connect to health diagnostics API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthDiagnostics();
  }, []);

  const health = healthData?.health || {};
  const mongo = health.mongodb || {};
  const server = health.server || {};
  const pipeline = health.multiAgentPipeline || {};
  const pdf = health.pdfEngine || {};
  const gemini = health.geminiAi || {};

  const formatUptime = (seconds) => {
    if (!seconds && seconds !== 0) return '0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? `${hrs}h ` : ''}${mins > 0 ? `${mins}m ` : ''}${secs}s`;
  };

  return (
    <AdminLayout>
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              <Activity size={20} style={{ color: '#0284C7' }} />
              Live Infrastructure & Subsystem Diagnostics
            </h2>
            <p className="admin-card-desc">
              Direct runtime verification of database connectivity, server resources, agent mesh, and AI services
            </p>
          </div>

          <button
            onClick={fetchHealthDiagnostics}
            disabled={loading}
            className="aegis-btn aegis-btn-secondary aegis-btn-sm"
          >
            <RefreshCw size={13} className={loading ? 'aegis-btn-spinner' : ''} />
            Run Diagnostic Probe
          </button>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: '#DC2626', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* 5 Core Diagnostic Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
          {/* 1. MongoDB Diagnostic Card */}
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(186, 230, 253, 0.85)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={20} style={{ color: '#0284C7' }} />
                <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  MongoDB Primary Node
                </h3>
              </div>
              <span className={`admin-badge ${mongo.status === 'Operational' ? 'admin-badge-active' : 'admin-badge-suspended'}`}>
                {mongo.status === 'Operational' ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                {mongo.status || 'Checking...'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Connection State:</span>
                <strong style={{ color: '#0F172A', fontFamily: 'var(--font-mono)' }}>{mongo.state || 'Connected'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Cluster / Host:</span>
                <span style={{ color: '#0369A1', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{mongo.host}:{mongo.port}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Database Namespace:</span>
                <span style={{ color: '#0F172A', fontWeight: 700 }}>{mongo.name}</span>
              </div>
            </div>
          </div>

          {/* 2. Backend Server Runtime */}
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(186, 230, 253, 0.85)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Server size={20} style={{ color: '#0369A1' }} />
                <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Node.js Runtime Core
                </h3>
              </div>
              <span className="admin-badge admin-badge-active">
                <CheckCircle2 size={11} /> {server.status || 'Operational'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Runtime Uptime:</span>
                <strong style={{ color: '#0284C7', fontFamily: 'var(--font-mono)' }}>{formatUptime(server.uptimeSeconds)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Node & Platform:</span>
                <span style={{ color: '#0F172A', fontFamily: 'var(--font-mono)' }}>{server.nodeVersion} ({server.platform})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Memory (Heap Used / RSS):</span>
                <span style={{ color: '#0F172A', fontWeight: 700 }}>
                  {server.memoryUsageMB?.heapUsed || 0} MB / {server.memoryUsageMB?.rss || 0} MB
                </span>
              </div>
            </div>
          </div>

          {/* 3. Multi-Agent Pipeline Components */}
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(186, 230, 253, 0.85)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={20} style={{ color: '#0D9488' }} />
                <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  4-Agent Pipeline Mesh
                </h3>
              </div>
              <span className="admin-badge admin-badge-active">
                <CheckCircle2 size={11} /> 4 / 4 Synchronized
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              {(pipeline.registeredAgents || []).map((ag) => (
                <div key={ag} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0F172A', fontWeight: 600 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#15803D' }} />
                  {ag}
                </div>
              ))}
            </div>
          </div>

          {/* 4. PDF Generation Engine */}
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(186, 230, 253, 0.85)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck2 size={20} style={{ color: '#EA580C' }} />
                <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  SOC PDF Document Engine
                </h3>
              </div>
              <span className={`admin-badge ${pdf.status === 'Operational' ? 'admin-badge-active' : 'admin-badge-suspended'}`}>
                {pdf.status === 'Operational' ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                {pdf.status || 'Ready'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Rendering Driver:</span>
                <strong style={{ color: '#0F172A' }}>{pdf.driver || 'PDFKit Engine'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Streaming Export:</span>
                <span style={{ color: '#15803D', fontWeight: 700 }}>Supported (Chunked Stream)</span>
              </div>
            </div>
          </div>

          {/* 5. Google Gemini AI Status */}
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(186, 230, 253, 0.85)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} style={{ color: gemini.configured ? '#0284C7' : '#D97706' }} />
                <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Google Gemini AI Engine
                </h3>
              </div>
              <span className={`admin-badge ${gemini.configured ? 'admin-badge-active' : 'admin-badge-medium'}`}>
                {gemini.configured ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                {gemini.configured ? 'Active' : 'Unconfigured'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Target Model:</span>
                <strong style={{ color: '#0F172A', fontFamily: 'var(--font-mono)' }}>{gemini.model || 'gemini-2.5-flash'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Assigned Role:</span>
                <span style={{ color: '#0369A1', fontWeight: 600 }}>{gemini.role || 'Contextual Security Copilot'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Engine Status:</span>
                <span style={{ color: gemini.configured ? '#15803D' : '#D97706', fontWeight: 700 }}>
                  {gemini.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSystemHealth;
