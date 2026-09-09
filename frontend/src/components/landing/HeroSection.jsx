import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  ShieldAlert,
  Zap,
  Info,
  LayoutDashboard,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import Badge from '../common/Badge';
import '../../styles/landing.css';

const HeroSection = () => {
  return (
    <section className="landing-hero">
      {/* Left Content */}
      <div className="landing-hero-content">
        <div className="landing-eyebrow">
          <Info size={14} style={{ color: '#2563EB' }} />
          <span>AegisSphere Security Platform</span>
        </div>

        <h1 className="landing-hero-title">
          Security Log Monitoring &
          <span className="blue-highlight">Threat Detection</span>
        </h1>

        <p className="landing-hero-desc">
          AegisSphere helps analyse security logs, identify possible threats, and review security events from one place.
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

      {/* Right Mockup Preview: Full Dark Rail + Pastel Blue SOC Dashboard */}
      <div className="landing-mockup-frame">
        <div className="landing-mockup-header">
          <div className="mockup-window-controls">
            <span className="mockup-dot" />
            <span className="mockup-dot" />
            <span className="mockup-dot" />
          </div>
          <span className="mockup-url-bar">https://aegissphere.io/dashboard</span>
          <span style={{ fontSize: '11px', color: '#15803D', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#15803D' }} />
            Live Preview
          </span>
        </div>

        {/* Inner Mockup with Dark Sidebar + Pastel Blue Surface */}
        <div style={{ display: 'flex', minHeight: '340px', background: '#DBEAFE' }}>
          {/* Left Dark Sidebar Rail */}
          <div style={{ width: '130px', background: '#0B132B', padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingBottom: '10px', borderBottom: '1px solid #1E293B' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                <Shield size={11} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#FFF' }}>AegisSphere</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
              <div style={{ background: '#2563EB', color: '#FFF', padding: '5px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <LayoutDashboard size={11} />
                <span>Dashboard</span>
              </div>
              <div style={{ color: '#94A3B8', padding: '4px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FileText size={10} />
                <span>Logs</span>
              </div>
              <div style={{ color: '#94A3B8', padding: '4px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ShieldAlert size={10} />
                <span>Threats</span>
              </div>
              <div style={{ color: '#94A3B8', padding: '4px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Search size={10} />
                <span>Forensics</span>
              </div>
            </div>
          </div>

          {/* Right Console Content Area */}
          <div style={{ flex: 1, padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Dashboard</h4>
                <span style={{ fontSize: '10px', color: '#64748B' }}>Welcome back, user</span>
              </div>
              <span style={{ background: '#E2EEFE', border: '1px solid #BFDBFE', padding: '2px 8px', borderRadius: '9999px', fontSize: '9.5px', color: '#1E40AF', fontWeight: 600 }}>
                Dashboard Preview
              </span>
            </div>

            {/* KPI Cards (3 in mockup) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '8px 10px', border: '1px solid #BFDBFE' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 600 }}>Total Logs</span>
                  <span style={{ fontSize: '8.5px', color: '#15803D', fontWeight: 700 }}>+12%</span>
                </div>
                <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block' }}>1,246</strong>
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '8px 10px', border: '1px solid #BFDBFE' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 600 }}>Threats Detected</span>
                  <span style={{ fontSize: '8.5px', color: '#EA580C', fontWeight: 700 }}>+12%</span>
                </div>
                <strong style={{ fontSize: '14px', color: '#EA580C', display: 'block' }}>8</strong>
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '8px 10px', border: '1px solid #BFDBFE' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 600 }}>Open Incidents</span>
                  <span style={{ fontSize: '8.5px', color: '#2563EB', fontWeight: 700 }}>+0%</span>
                </div>
                <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block' }}>5</strong>
              </div>
            </div>

            {/* Recent Threats Table Mockup */}
            <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '10px', border: '1px solid #BFDBFE' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', fontSize: '10px', fontWeight: 700, color: '#0F172A' }}>
                <span>Recent Threats</span>
                <span style={{ color: '#2563EB', fontSize: '9.5px' }}>Live Telemetry</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { name: 'SSH Password Spraying', sev: 'critical', ip: 'Ingress Node', time: 'Rule T1110' },
                  { name: 'SQL Injection Attack', sev: 'high', ip: 'Web Gateway', time: 'Rule T1190' },
                  { name: 'Port Recon Sweep', sev: 'medium', ip: 'DMZ Router', time: 'Rule T1595' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: idx < 2 ? '1px solid #F1F5F9' : 'none', fontSize: '9.5px' }}>
                    <span style={{ fontWeight: 600, color: '#1E293B', width: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                    <Badge variant={item.sev} size="sm">{item.sev}</Badge>
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#64748B', fontSize: '9px' }}>{item.ip}</span>
                    <span style={{ color: '#94A3B8', fontSize: '8.5px' }}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
