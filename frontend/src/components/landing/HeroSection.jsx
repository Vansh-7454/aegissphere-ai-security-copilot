import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  ShieldAlert,
  Info,
  LayoutDashboard,
  FileText,
  Search,
} from 'lucide-react';
import Badge from '../common/Badge';
import '../../styles/landing.css';

const HeroSection = () => {
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
          <span className="mockup-url-bar">https://aegissphere.io/dashboard</span>
          <span style={{ fontSize: '11px', color: '#15803D', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#15803D' }} />
            Live Preview
          </span>
        </div>

        {/* Inner Mockup with Light Blue Sidebar + Card Surfaces */}
        <div style={{ display: 'flex', minHeight: '340px', background: 'linear-gradient(135deg, #F8FCFE 0%, #F0F9FF 100%)' }}>
          {/* Left Light Sidebar Rail */}
          <div style={{ width: '130px', background: '#FFFFFF', padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0, borderRight: '1px solid rgba(186, 230, 253, 0.75)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingBottom: '10px', borderBottom: '1px solid rgba(186, 230, 253, 0.6)' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                <Shield size={12} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A' }}>AegisSphere</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
              <div style={{ background: '#E0F2FE', color: '#0284C7', padding: '5px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', border: '1px solid #BAE6FD' }}>
                <LayoutDashboard size={11} />
                <span>Dashboard</span>
              </div>
              <div style={{ color: '#475569', padding: '4px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FileText size={10} />
                <span>Logs</span>
              </div>
              <div style={{ color: '#475569', padding: '4px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ShieldAlert size={10} />
                <span>Threats</span>
              </div>
              <div style={{ color: '#475569', padding: '4px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
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
                <span style={{ fontSize: '10px', color: '#64748B' }}>Welcome back, analyst</span>
              </div>
              <span style={{ background: '#E0F2FE', border: '1px solid #BAE6FD', padding: '2px 8px', borderRadius: '9999px', fontSize: '9.5px', color: '#0284C7', fontWeight: 700 }}>
                Live Stream
              </span>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '8px 10px', border: '1px solid rgba(186, 230, 253, 0.75)', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 600 }}>Total Logs</span>
                  <span style={{ fontSize: '8.5px', color: '#15803D', fontWeight: 700 }}>+12%</span>
                </div>
                <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block' }}>1,246</strong>
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '8px 10px', border: '1px solid rgba(186, 230, 253, 0.75)', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 600 }}>Threats Detected</span>
                  <span style={{ fontSize: '8.5px', color: '#EA580C', fontWeight: 700 }}>Active</span>
                </div>
                <strong style={{ fontSize: '14px', color: '#EA580C', display: 'block' }}>8</strong>
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '8px 10px', border: '1px solid rgba(186, 230, 253, 0.75)', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 600 }}>Open Incidents</span>
                  <span style={{ fontSize: '8.5px', color: '#0284C7', fontWeight: 700 }}>Active</span>
                </div>
                <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block' }}>5</strong>
              </div>
            </div>

            {/* Recent Threats Table Mockup */}
            <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '10px', border: '1px solid rgba(186, 230, 253, 0.75)', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', fontSize: '10px', fontWeight: 700, color: '#0F172A' }}>
                <span>Recent Threats</span>
                <span style={{ color: '#0284C7', fontSize: '9.5px' }}>Live Telemetry</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { name: 'SSH Password Spraying', sev: 'critical', ip: 'Ingress Node', time: 'Rule T1110' },
                  { name: 'SQL Injection Attack', sev: 'high', ip: 'Web Gateway', time: 'Rule T1190' },
                  { name: 'Port Recon Sweep', sev: 'medium', ip: 'DMZ Router', time: 'Rule T1595' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: idx < 2 ? '1px solid rgba(186, 230, 253, 0.4)' : 'none', fontSize: '9.5px' }}>
                    <span style={{ fontWeight: 600, color: '#0F172A', width: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                    <Badge variant={item.sev} size="sm">{item.sev}</Badge>
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#0284C7', fontSize: '9px' }}>{item.ip}</span>
                    <span style={{ color: '#64748B', fontSize: '8.5px' }}>{item.time}</span>
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
