import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  Activity,
  Upload,
  RefreshCw,
  ArrowRight,
  Clock,
  Zap,
  CheckCircle2,
  Cpu,
  BarChart2,
  Flame,
  AlertTriangle,
  FolderOpen,
  FlaskConical,
  FileCheck2,
} from 'lucide-react';

import api from '../services/api';
import Layout from '../components/common/Layout';
import StatCard from '../components/dashboard/StatCard';
import ThreatTrendChart from '../components/charts/ThreatTrendChart';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalLogs: 0,
    totalThreats: 0,
    criticalThreats: 0,
    highThreats: 0,
    openIncidents: 0,
  });

  const [threats, setThreats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard');
      const data = response.data || {};

      const threatList = data.threats || data.recentThreats || [];
      const activityList = data.recentActivity || [];
      const trendList = data.threatTrend || [];

      setStats({
        totalLogs: data.totalLogs ?? data.stats?.totalLogs ?? 0,
        totalThreats: data.totalThreats ?? data.stats?.totalThreats ?? threatList.length,
        criticalThreats: data.criticalThreats ?? data.stats?.criticalThreats ?? 0,
        highThreats: data.highThreats ?? data.stats?.highThreats ?? 0,
        openIncidents: data.openIncidents ?? data.stats?.openIncidents ?? 0,
      });

      setThreats(threatList);
      setRecentActivity(activityList);
      setTrendData(trendList);
    } catch (error) {
      console.error('Dashboard loading error:', error);
      setStats({
        totalLogs: 0,
        totalThreats: 0,
        criticalThreats: 0,
        highThreats: 0,
        openIncidents: 0,
      });
      setThreats([]);
      setRecentActivity([]);
      setTrendData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const getSeverityVariant = (sev) => {
    const s = (sev || '').toLowerCase();
    if (s === 'critical') return 'critical';
    if (s === 'high') return 'high';
    if (s === 'low') return 'low';
    return 'medium';
  };

  const formatTimestamp = (val) => {
    if (!val) return 'Recently';
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return String(val);
    return d.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <div className="soc-container">
        {/* Page Header */}
        <div className="soc-page-header">
          <div>
            <h1 className="soc-page-title" style={{ fontSize: '24px', margin: 0 }}>
              Command Center Overview
            </h1>
            <p className="soc-page-subtitle" style={{ fontSize: '13px', margin: '2px 0 0 0', color: '#64748B' }}>
              Real-time security log monitoring, heuristic threat detection, and telemetry status.
            </p>
          </div>

          <div className="soc-actions-group">
            <button
              onClick={loadDashboard}
              disabled={loading}
              className="aegis-btn aegis-btn-secondary aegis-btn-sm"
            >
              <RefreshCw size={13} className={loading ? 'aegis-btn-spinner' : ''} />
              Refresh
            </button>
            <Link to="/logs" className="aegis-btn aegis-btn-primary aegis-btn-sm">
              <Upload size={13} />
              Upload Logs
            </Link>
          </div>
        </div>

        {/* 4 Real KPI Metric Cards */}
        <div className="soc-stats-grid">
          <StatCard
            label="Total Logs"
            value={stats.totalLogs}
            icon={FolderOpen}
            subtext="Ingested security files"
          />
          <StatCard
            label="Threats Detected"
            value={stats.totalThreats}
            icon={ShieldAlert}
            variant="high"
            subtext="Identified threat events"
          />
          <StatCard
            label="Critical Threats"
            value={stats.criticalThreats}
            icon={Flame}
            variant="critical"
            subtext="Immediate triage priority"
          />
          <StatCard
            label="Open Incidents"
            value={stats.openIncidents}
            icon={Zap}
            variant="default"
            subtext="Active response tickets"
          />
        </div>

        {/* Quick Actions Navigation Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <Link
            to="/logs"
            className="aegis-card aegis-card-interactive aegis-card-pad-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '13.5px', color: 'var(--text-heading)', display: 'block' }}>Upload Logs</strong>
              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Ingest .log, .txt, .csv, .json</span>
            </div>
          </Link>

          <Link
            to="/threats"
            className="aegis-card aegis-card-interactive aegis-card-pad-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '13.5px', color: 'var(--text-heading)', display: 'block' }}>Investigate Threats</strong>
              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Review forensics & MITRE tags</span>
            </div>
          </Link>

          <Link
            to="/security-test"
            className="aegis-card aegis-card-interactive aegis-card-pad-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EDE9FE', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FlaskConical size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '13.5px', color: 'var(--text-heading)', display: 'block' }}>Run Security Test</strong>
              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Simulate controlled attack tests</span>
            </div>
          </Link>

          <Link
            to="/reports"
            className="aegis-card aegis-card-interactive aegis-card-pad-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileCheck2 size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '13.5px', color: 'var(--text-heading)', display: 'block' }}>View Reports</strong>
              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Audit summaries & exports</span>
            </div>
          </Link>
        </div>

        {/* Threats Overview Chart & Recent Activity Feed */}
        <div className="soc-charts-grid">
          {/* Left Chart Card */}
          <div className="soc-chart-card">
            <div className="soc-chart-header">
              <h3 className="soc-chart-title">Detection Trend</h3>
              <span className="soc-chart-badge">7-Day Activity</span>
            </div>
            <div className="soc-chart-container">
              {stats.totalThreats === 0 ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '8px' }}>
                  <Activity size={28} style={{ opacity: 0.4 }} />
                  <span style={{ fontSize: '13px' }}>No threat trend telemetry yet. Upload log files to visualize activity over time.</span>
                </div>
              ) : (
                <ThreatTrendChart data={trendData} />
              )}
            </div>
          </div>

          {/* Right Recent Activity Card */}
          <div className="soc-chart-card">
            <div className="soc-chart-header">
              <h3 className="soc-chart-title">Recent Activity</h3>
              <span className="soc-chart-badge">Audit Telemetry</span>
            </div>

            <div className="soc-activity-list">
              {recentActivity.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No security events or uploads logged yet.
                </div>
              ) : (
                recentActivity.map((act) => (
                  <div key={act.id} className="soc-activity-item">
                    <span className={`soc-activity-dot ${act.severity || 'low'}`} />
                    <div className="soc-activity-info">
                      <span className="soc-activity-title">{act.title}</span>
                      <span className="soc-activity-time">{formatTimestamp(act.time)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Threats Table Card */}
        <div className="soc-table-card">
          <div className="soc-table-header">
            <div>
              <h3 className="soc-table-title">Recent Threats</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Latest security events identified from ingested logs.
              </p>
            </div>
            <Link to="/threats" className="aegis-btn aegis-btn-outline aegis-btn-sm">
              View All Threats
              <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Fetching detected threats..." />
          ) : threats.length === 0 ? (
            <EmptyState
              title="No Threats Detected Yet"
              description="Upload security logs in the Ingestion Gateway or run a controlled test in the Security Test Lab to start analyzing threats."
              action={
                <Link to="/logs" className="aegis-btn aegis-btn-primary aegis-btn-sm">
                  <Upload size={13} />
                  Upload Logs
                </Link>
              }
            />
          ) : (
            <div className="soc-table-container">
              <table className="soc-table">
                <thead>
                  <tr>
                    <th>Threat</th>
                    <th>Severity</th>
                    <th>Source IP</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {threats.slice(0, 6).map((threat, idx) => (
                    <tr key={threat._id || threat.id || idx}>
                      <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                        {threat.threatType || threat.attackType || 'Security Event'}
                      </td>
                      <td>
                        <Badge variant={getSeverityVariant(threat.severity)}>
                          {threat.severity || 'Medium'}
                        </Badge>
                      </td>
                      <td className="soc-ip-cell">
                        {threat.sourceIp ? threat.sourceIp : <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontStyle: 'italic' }}>Not available</span>}
                      </td>
                      <td className="soc-time-cell">
                        {formatTimestamp(threat.createdAt)}
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
                        <Link
                          to="/threats"
                          className="aegis-btn aegis-btn-ghost aegis-btn-sm"
                          style={{ color: '#2563EB', fontWeight: 600 }}
                        >
                          Investigate
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;