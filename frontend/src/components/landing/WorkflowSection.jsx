import React from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, Play } from 'lucide-react';
import '../../styles/landing.css';

const WorkflowSection = () => {
  const tests = [
    {
      title: 'SQL Injection Simulation',
      desc: 'Simulate unsanitized SQL query strings against public HTTP login and search routes to verify automatic WAF signature filtering.',
      tag: 'Web Security',
      tagBg: '#EDE9FE',
      tagColor: '#7C3AED',
      tagBorder: '#DDD6FE',
      type: 'SQL Injection',
    },
    {
      title: 'Cross-Site Scripting (XSS)',
      desc: 'Test for payload script execution and parameter reflection vulnerabilities to ensure output encoding directives trigger.',
      tag: 'Application Test',
      tagBg: '#E0F2FE',
      tagColor: '#0284C7',
      tagBorder: '#BAE6FD',
      type: 'XSS Injection',
    },
    {
      title: 'SSH Brute Force Spray',
      desc: 'Simulate high-frequency credential stuffing bursts on port 22 to confirm threshold lockout and immediate classification.',
      tag: 'Network Defense',
      tagBg: '#FEF3C7',
      tagColor: '#D97706',
      tagBorder: '#FDE68A',
      type: 'SSH Brute Force',
    },
    {
      title: 'Port & Reconnaissance Probe',
      desc: 'Test for open listening service sweeps and port reconnaissance anomalies across firewall and gateway logs.',
      tag: 'Recon Test',
      tagBg: '#CCFBF1',
      tagColor: '#0D9488',
      tagBorder: '#99F6E4',
      type: 'Port Scan',
    },
  ];

  return (
    <section id="testlab" className="landing-section">
      <div className="landing-section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
            <FlaskConical size={18} />
          </div>
          <h2 className="landing-section-title" style={{ margin: 0 }}>
            Security Test Lab
          </h2>
        </div>
        <p className="landing-section-subtitle">
          Execute controlled security simulations to safely validate how AegisSphere detects and classifies adversarial tactics.
        </p>
      </div>

      <div className="landing-testlab-grid">
        {tests.map((test, idx) => (
          <div key={idx} className="landing-testlab-card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {test.title}
                </h4>
                <span style={{ fontSize: '11px', background: test.tagBg, color: test.tagColor, border: `1px solid ${test.tagBorder}`, padding: '2px 8px', borderRadius: '9999px', fontWeight: 700 }}>
                  {test.tag}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.55', margin: 0 }}>
                {test.desc}
              </p>
            </div>

            <Link
              to="/login"
              className="aegis-btn aegis-btn-primary aegis-btn-sm"
              style={{ flexShrink: 0, gap: '6px' }}
            >
              <Play size={12} />
              Run Test
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WorkflowSection;
