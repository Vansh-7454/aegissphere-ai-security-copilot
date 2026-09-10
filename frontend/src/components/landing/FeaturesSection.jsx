import React from 'react';
import {
  FileText,
  ShieldAlert,
  Search,
  FlaskConical,
  FileCheck2,
  Workflow,
  Cpu,
  ShieldCheck,
  BrainCircuit,
  Layers,
} from 'lucide-react';
import '../../styles/landing.css';

const FeaturesSection = () => {
  const miniGridCards = [
    {
      title: 'Log Parser Agent',
      iconBg: '#EDE9FE',
      iconColor: '#7C3AED',
      icon: FileText,
      hasDots: true,
    },
    {
      title: 'Threat Detection',
      iconBg: '#E0F2FE',
      iconColor: '#0284C7',
      icon: ShieldAlert,
    },
    {
      title: 'Threat Classifier Agent',
      iconBg: '#DCFCE7',
      iconColor: '#15803D',
      icon: Cpu,
    },
    {
      title: 'Ingestion Gateway',
      iconBg: '#CFFAFE',
      iconColor: '#0891B2',
      icon: Layers,
    },
    {
      title: 'Threat Classifier Analysis',
      iconBg: '#EDE9FE',
      iconColor: '#7C3AED',
      icon: BrainCircuit,
    },
    {
      title: 'Criteria Anomaly',
      iconBg: '#FEE2E2',
      iconColor: '#DC2626',
      icon: ShieldCheck,
    },
  ];

  const features = [
    {
      icon: FileText,
      iconType: 'blue',
      title: 'Log Analysis',
      desc: 'Upload and analyze security log files (.log, .txt, .csv, .json) to extract structured events.',
    },
    {
      icon: ShieldAlert,
      iconType: 'blue',
      title: 'Threat Detection',
      desc: 'Identify possible threats from log activity such as brute force, SQL injection, and scans.',
    },
    {
      icon: Search,
      iconType: 'cyan',
      title: 'Threat Forensics',
      desc: 'Review detected threats and their details including source IP, confidence, and timestamps.',
    },
    {
      icon: FlaskConical,
      iconType: 'purple',
      title: 'Security Test Lab',
      desc: 'Generate controlled security test cases to validate how the system handles security threats.',
    },
    {
      icon: FileCheck2,
      iconType: 'cyan',
      title: 'Security Reports',
      desc: 'View reports related to analyzed security events with exportable incident summaries.',
    },
    {
      icon: Workflow,
      iconType: 'blue',
      title: 'AI Agent Workflow',
      desc: 'See how different agents are planned to support security analysis and threat remediation.',
    },
  ];

  return (
    <section id="features" className="landing-section">
      {/* Light-Blue Gradient Showcase Container */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ marginBottom: '14px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            System Architecture & Features
          </span>
        </div>

        <div className="teal-gradient-banner">
          {/* Left Column: Layout Option Grid View */}
          <div className="teal-banner-left">
            <span className="teal-banner-heading">Multi-Agent Processing Mesh</span>

            {/* Sub-Container */}
            <div className="teal-mini-grid-container">
              <div className="teal-mini-grid">
                {miniGridCards.map((c, idx) => {
                  const Icon = c.icon;
                  return (
                    <div key={idx} className="teal-mini-card">
                      <div
                        className="teal-mini-icon"
                        style={{ background: c.iconBg, color: c.iconColor }}
                      >
                        <Icon size={15} />
                      </div>
                      <span className="teal-mini-title">{c.title}</span>
                      {c.hasDots && (
                        <div style={{ display: 'flex', gap: '3px', marginTop: '2px' }}>
                          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#0284C7' }} />
                          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#F59E0B' }} />
                          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#10B981' }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Feature Detail & Synchronicity */}
          <div className="teal-banner-right-wrapper">
            <span className="teal-banner-heading" style={{ color: '#0F172A', marginBottom: '14px' }}>
              Feature Detail & Synchronicity
            </span>

            <div className="teal-banner-right">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                <div className="teal-detail-row">
                  <span className="teal-detail-title">Log Analysis</span>
                  <span className="teal-detail-desc">
                    Upload and analyze security log files (log, txt, csv, json) to extract structured events.
                  </span>
                </div>

                <div className="teal-detail-row">
                  <span className="teal-detail-title">Threat Detection</span>
                  <span className="teal-detail-desc">
                    Identify possible threats from log activity such as brute force, SQL injection, and scans.
                  </span>
                </div>

                <div className="teal-detail-row">
                  <span className="teal-detail-title">Threat Forensics</span>
                  <span className="teal-detail-desc">
                    Review detected threats and their details including source IP, confidence, and timestamps.
                  </span>
                </div>
              </div>

              {/* Semicircular Synchronicity Speed Gauge */}
              <div className="synchronicity-gauge-box">
                <span style={{ fontSize: '11px', color: '#0F172A', fontWeight: 800, fontFamily: 'var(--font-sans)' }}>
                  Synchronicity
                </span>

                <div style={{ position: 'relative', width: '90px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="90" height="50" viewBox="0 0 100 55">
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="#BAE6FD"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 10 50 A 40 40 0 0 1 78 22"
                      fill="none"
                      stroke="url(#gaugeGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    {/* Gauge needle */}
                    <line x1="50" y1="50" x2="72" y2="28" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="4" fill="#0F172A" />
                    <defs>
                      <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0284C7" />
                        <stop offset="60%" stopColor="#06B6D4" />
                        <stop offset="100%" stopColor="#38BDF8" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <span style={{ fontSize: '10.5px', color: '#0284C7', fontWeight: 800, fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>
                  Live Telemetry Sync
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 6-Card Feature Bento Grid */}
      <div className="landing-section-header">
        <h2 className="landing-section-title">
          Platform Capabilities
        </h2>
        <p className="landing-section-subtitle">
          Comprehensive tools engineered for cybersecurity log analysis, threat intelligence, and triage.
        </p>
      </div>

      <div className="landing-bento-grid">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="landing-bento-card">
              <div className={`landing-bento-icon ${item.iconType}`}>
                <Icon size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.55', margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturesSection;
