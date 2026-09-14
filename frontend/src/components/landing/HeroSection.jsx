import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  ShieldAlert,
  Info,
  LayoutDashboard,
  FileText,
  Search,
  Activity,
} from 'lucide-react';
import Badge from '../common/Badge';
import api from '../../services/api';
import '../../styles/landing.css';

const HeroSection = () => {
  const [liveData, setLiveData] = useState({
    totalLogs: 0,
    totalThreats: 0,
    openIncidents: 0,
    recentThreats: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchLivePreview = async () => {
      try {
        const res = await api.get('/auth/platform-preview');
        if (res.data?.success && isMounted) {
          setLiveData({
            totalLogs: res.data.stats?.totalLogs || 0,
            totalThreats: res.data.stats?.totalThreats || 0,
            openIncidents: res.data.stats?.openIncidents || 0,
            recentThreats: res.data.recentThreats || [],
          });
        }
      } catch (err) {
        console.warn('Failed to fetch live platform preview:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLivePreview();
    const interval = setInterval(fetchLivePreview, 15000); // Poll every 15s for live updates
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="landing-hero">
      {/* Left Content */}
      <div className="landing-hero-content">
        <div className="landing-eyebrow">
          <Info size={14} style={{ color: '#0284C7' }} />
          <span>AegisSphere Security Platform</span>
        </div>

        <h1 className="landing-hero-title">
          Security Log Monitoring &
          <span className="blue-highlight">Threat Detection</span>
        </h1>

        <p className="landing-hero-desc">
          AegisSphere helps analyse security logs, identify possible threats, and review security events with high-performance multi-agent telemetry.
        </p>

        <div className="landing-hero-ctas">
          <Link to="/login" className="aegis-btn aegis-btn-primary aegis-btn-lg">
            Open Console
            <ArrowRight size={16} />
          </Link>
          <a href="#features" className="aegis-btn aegis-btn-secondary aegis-btn-lg">
            View Features
          </a>
        </div>
      </div>

      {/* Right Mockup Preview: Light Blue SaaS Dashboard */}
      <div className="landing-mockup-frame">
        <div className="landing-mockup-header">
          <div className="mockup-window-controls">
            <span className="mockup-dot" />
            <span className="mockup-dot" />
            <span className="mockup-dot" />
          </div>
          <span className="mockup-url-bar">https://aegissphere.io/admin</span>
          <span style={{ fontSize: '11px', color: '#15803D', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#15803D', animation: 'pulse 2s infinite' }} />
            Real-Time Live
          </span>
        </div>

        {/* Inner Mockup with Light Blue Sidebar + Card Surfaces */}
        <div className="mockup-body">
          {/* Left Light Sidebar Rail */}
          <div className="mockup-sidebar">
            <div className="mockup-sidebar-header">
              <div className="mockup-brand-badge">
                <Shield size={12} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A' }}>AegisSphere</span>
            </div>

            <div className="mockup-sidebar-nav">
              <div className="mockup-nav-active">
                <LayoutDashboard size={11} />
                <span>Overview</span>
              </div>
              <div className="mockup-nav-item">
                <FileText size={10} />
                <span>Logs</span>
              </div>
              <div className="mockup-nav-item">
                <ShieldAlert size={10} />
                <span>Threats</span>
              </div>
              <div className="mockup-nav-item">
                <Search size={10} />
                <span>Forensics</span>
              </div>
            </div>
          </div>

          {/* Right Console Content Area */}
          <div className="mockup-content">
            <div className="mockup-content-header">
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: 0 }}>SOC Telemetry</h4>
                <span style={{ fontSize: '10px', color: '#64748B' }}>Live Platform Overview</span>
              </div>
              <span style={{ background: '#DCFCE7', border: '1px solid #BBF7D0', padding: '2px 8px', borderRadius: '9999px', fontSize: '9.5px', color: '#15803D', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Activity size={10} />
                Live Stream
              </span>
            </div>

            {/* KPI Cards */}
            <div className="mockup-kpi-grid">
              <div className="mockup-kpi-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 600 }}>Total Logs</span>
                  <span style={{ fontSize: '8.5px', color: '#15803D', fontWeight: 700 }}>Real-time</span>
                </div>
                <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block' }}>
                  {loading ? '...' : liveData.totalLogs.toLocaleString()}
                </strong>
              </div>

              <div className="mockup-kpi-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 600 }}>Threats Detected</span>
                  <span style={{ fontSize: '8.5px', color: '#DC2626', fontWeight: 700 }}>Active</span>
                </div>
                <strong style={{ fontSize: '14px', color: '#DC2626', display: 'block' }}>
                  {loading ? '...' : liveData.totalThreats.toLocaleString()}
                </strong>
              </div>

              <div className="mockup-kpi-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 600 }}>Open Incidents</span>
                  <span style={{ fontSize: '8.5px', color: '#0284C7', fontWeight: 700 }}>Active</span>
                </div>
                <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block' }}>
                  {loading ? '...' : liveData.openIncidents.toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Recent Threats Table Mockup */}
            <div className="mockup-table-box">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', fontSize: '10px', fontWeight: 700, color: '#0F172A' }}>
                <span>Recent Platform Detections</span>
                <span style={{ color: '#0284C7', fontSize: '9.5px' }}>Live Telemetry</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {liveData.recentThreats.length > 0 ? (
                  liveData.recentThreats.slice(0, 3).map((item, idx) => (
                    <div
                      key={item.id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 0',
                        borderBottom: idx < 2 ? '1px solid rgba(186, 230, 253, 0.4)' : 'none',
                        fontSize: '9.5px',
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          color: '#0F172A',
                          width: '120px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.name}
                      </span>
                      <Badge variant={item.sev} size="sm">{item.severity}</Badge>
                      <span style={{ fontFamily: 'var(--font-mono)', color: '#0284C7', fontSize: '9px' }}>
                        {item.ip}
                      </span>
                      <span style={{ color: '#64748B', fontSize: '8.5px', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.time}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '8px', color: '#64748B', fontSize: '10px' }}>
                    {loading ? 'Connecting to live telemetry stream...' : 'No threats detected in database.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
