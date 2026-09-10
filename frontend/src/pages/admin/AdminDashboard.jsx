import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';
import {
  Users,
  FileText,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Activity,
  Cpu,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import '../../styles/admin.css';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/dashboard');
      if (response.data?.success) {
        setData(response.data);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      setError(err.response?.data?.message || 'Failed to connect to Admin Analytics API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDashboard();
  }, []);

  const stats = data?.stats || {};
  const severityData = data?.severityBreakdown || [];
  const trendData = data?.threatTrend || [];
  const activityData = data?.recentActivity || [];

  return (
    <AdminLayout>
      {/* Admin Hero Header */}
      <div className="dashboard-hero-card" style={{ marginBottom: '4px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span className="soc-status-indicator">
              <span className="soc-status-dot" />
              <span className="soc-status-label">Master Console Active</span>
            </span>
            <span style={{ fontSize: '12px', color: '#DC2626', fontWeight: 800, background: '#FEE2E2', padding: '3px 10px', borderRadius: '9999px', border: '1px solid #FECACA' }}>
              Full Platform Scope
            </span>
          </div>

          <h1 className="dashboard-hero-title">
            Enterprise SOC Administration
          </h1>
          <p className="dashboard-hero-desc">
            Centralized platform oversight: live multi-tenant user management, aggregated threat forensics, incident lifecycle auditing, and multi-agent health.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={fetchAdminDashboard}
            disabled={loading}
            className="aegis-btn aegis-btn-secondary aegis-btn-md"
          >
            <RefreshCw size={14} className={loading ? 'aegis-btn-spinner' : ''} />
            Refresh Analytics
          </button>
          <Link to="/admin/health" className="aegis-btn aegis-btn-primary aegis-btn-md">
            <Activity size={14} />
            System Health
          </Link>
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: '#DC2626', fontSize: '13.5px', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* 4 Primary KPI Stat Cards */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">TOTAL OPERATORS</span>
            <div className="admin-kpi-icon" style={{ background: '#E0F2FE', color: '#0284C7' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="admin-kpi-value">{loading ? '...' : (stats.totalUsers ?? 0)}</div>
          <div className="admin-kpi-subtext">
            <strong>{stats.activeUsers ?? 0}</strong> Active · <strong>{stats.suspendedUsers ?? 0}</strong> Suspended
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">INGESTED LOGS</span>
            <div className="admin-kpi-icon" style={{ background: '#F0F9FF', color: '#0369A1' }}>
              <FileText size={18} />
            </div>
          </div>
          <div className="admin-kpi-value">{loading ? '...' : (stats.totalLogs ?? 0)}</div>
          <div className="admin-kpi-subtext">
            Platform-wide raw telemetry streams
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">DETECTED THREATS</span>
            <div className="admin-kpi-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>
              <ShieldAlert size={18} />
            </div>
          </div>
          <div className="admin-kpi-value" style={{ color: '#DC2626' }}>{loading ? '...' : (stats.totalThreats ?? 0)}</div>
          <div className="admin-kpi-subtext">
            <span style={{ color: '#DC2626', fontWeight: 700 }}>{stats.criticalThreats ?? 0} Critical</span> · {stats.highThreats ?? 0} High
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">INCIDENTS & REPORTS</span>
            <div className="admin-kpi-icon" style={{ background: '#FFEDD5', color: '#EA580C' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="admin-kpi-value">{loading ? '...' : (stats.totalIncidents ?? 0)}</div>
          <div className="admin-kpi-subtext">
            <strong>{stats.openIncidents ?? 0}</strong> Open Incidents · <strong>{stats.totalReports ?? 0}</strong> Reports
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* 7-Day Trend Chart */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <TrendingUp size={18} style={{ color: '#0284C7' }} />
                Platform Threat Volume (7-Day Telemetry)
              </h3>
              <p className="admin-card-desc">Actual verified security anomalies identified across all ingestions</p>
            </div>
          </div>

          <div style={{ width: '100%', height: '260px' }}>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminThreatGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284C7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#FFFFFF', border: '1px solid #BAE6FD', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="threats" stroke="#0284C7" strokeWidth={2.5} fillOpacity={1} fill="url(#adminThreatGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '13px' }}>
                No trend telemetry available.
              </div>
            )}
          </div>
        </div>

        {/* Severity Donut Chart */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <ShieldCheck size={18} style={{ color: '#DC2626' }} />
                Severity Breakdown
              </h3>
              <p className="admin-card-desc">Platform-wide threat classification</p>
            </div>
          </div>

          <div style={{ width: '100%', height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {severityData.some((d) => d.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#FFFFFF', border: '1px solid #BAE6FD', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ color: '#94A3B8', fontSize: '13px', textAlign: 'center' }}>
                No active threats recorded.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Unified Telemetry Stream */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">
              <Cpu size={18} style={{ color: '#0369A1' }} />
              Live Platform Telemetry Feed
            </h3>
            <p className="admin-card-desc">Real-time stream of latest log ingestions, threat detections, and incident escalations</p>
          </div>
          <Link to="/admin/audit-logs" style={{ fontSize: '12.5px', color: '#0284C7', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View Full Audit Trail <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activityData.length > 0 ? (
            activityData.map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: '#F8FCFE',
                  border: '1px solid rgba(186, 230, 253, 0.6)',
                  borderRadius: 'var(--radius-md)',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`admin-badge admin-badge-${act.severity || 'low'}`}>
                    {act.type}
                  </span>
                  <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>
                    {act.title}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#64748B' }}>
                  <span>Actor: <strong style={{ color: '#0369A1' }}>{act.actor}</strong></span>
                  <span>{new Date(act.time).toLocaleTimeString()} ({new Date(act.time).toLocaleDateString()})</span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
              No telemetry events recorded yet.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
