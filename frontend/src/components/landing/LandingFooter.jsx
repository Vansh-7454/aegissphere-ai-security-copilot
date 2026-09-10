import React from 'react';
import { Shield, Mail, Globe } from 'lucide-react';
import '../../styles/landing.css';

const LandingFooter = () => {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-container">
        {/* Col 1: Brand & Details */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div className="landing-brand-icon" style={{ width: '26px', height: '26px' }}>
              <Shield size={14} />
            </div>
            <span style={{ fontWeight: 800, color: 'var(--text-heading)', fontSize: '16px' }}>
              AegisSphere
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '360px', lineHeight: '1.6', margin: 0 }}>
            AegisSphere is an intelligent security operations platform designed for security log monitoring, rule-based threat detection, and forensic telemetry investigation.
          </p>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Quick Links
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a href="/login" className="landing-nav-link" style={{ fontSize: '13px' }}>Dashboard</a>
            <a href="#features" className="landing-nav-link" style={{ fontSize: '13px' }}>All Features</a>
            <a href="#testlab" className="landing-nav-link" style={{ fontSize: '13px' }}>Test Lab</a>
            <a href="#agents" className="landing-nav-link" style={{ fontSize: '13px' }}>AI Agents</a>
            <a href="#faq" className="landing-nav-link" style={{ fontSize: '13px' }}>FAQ</a>
          </div>
        </div>

        {/* Col 3: Get in Touch */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Get in Touch
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <Mail size={14} style={{ color: 'var(--accent-primary)' }} />
              <span>aegissphere@gmail.com</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
              Autonomous SOC Operations & Threat Forensics Platform
            </p>
          </div>
        </div>
      </div>

      <div className="landing-footer-bottom">
        <span>© {new Date().getFullYear()} AegisSphere. All rights reserved.</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Security First</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Rule Engine Active</span>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
