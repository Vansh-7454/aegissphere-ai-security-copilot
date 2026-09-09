import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Zap, Globe, Cpu, Database } from 'lucide-react';
import '../../styles/landing.css';

const WorkflowSection = () => {
  const tests = [
    {
      title: 'SQL Injection',
      desc: 'Test for SQL injection vulnerabilities & payload detection.',
      tag: 'Web Test',
      type: 'SQL Injection',
    },
    {
      title: 'XSS Injection',
      desc: 'Test for script execution & cross-site scripting flaws.',
      tag: 'Malware Test',
      type: 'XSS Injection',
    },
    {
      title: 'Brute Force',
      desc: 'Test for authentication flooding & credential spraying.',
      tag: 'Network Test',
      type: 'SSH Brute Force',
    },
    {
      title: 'Port Scanning',
      desc: 'Test for open reconnaissance probes and service discovery.',
      tag: 'Port Test',
      type: 'Port Scan',
    },
  ];

  return (
    <section id="testlab" className="landing-section">
      <div className="landing-section-header" style={{ textAlign: 'left', margin: '0 0 32px 0', maxWidth: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
            <ShieldCheck size={16} />
          </div>
          <h2 className="landing-section-title" style={{ fontSize: '26px', margin: 0 }}>
            Security Test Lab
          </h2>
        </div>
        <p className="landing-section-subtitle" style={{ fontSize: '14.5px' }}>
          Use controlled test cases to check how the system handles common security threats.
        </p>
      </div>

      <div className="landing-testlab-grid">
        {tests.map((test, idx) => (
          <div key={idx} className="landing-testlab-card">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
                  {test.title}
                </h4>
                <span style={{ fontSize: '10.5px', background: '#EDE9FE', color: '#6366F1', border: '1px solid #DDD6FE', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600 }}>
                  {test.tag}
                </span>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                {test.desc}
              </p>
            </div>

            <Link
              to="/login"
              className="aegis-btn aegis-btn-primary aegis-btn-sm"
              style={{ flexShrink: 0 }}
            >
              Generate Test
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WorkflowSection;
