import React from 'react';
import {
  FileText,
  ShieldAlert,
  Search,
  FlaskConical,
  FileCheck2,
  Workflow,
} from 'lucide-react';
import '../../styles/landing.css';

const FeaturesSection = () => {
  const features = [
    {
      icon: FileText,
      iconType: 'purple',
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
      iconType: 'purple',
      title: 'AI Agent Workflow',
      desc: 'See how different agents are planned to support security analysis and threat remediation.',
    },
  ];

  return (
    <section id="features" className="landing-section">
      <div className="landing-section-header" style={{ textAlign: 'left', margin: '0 0 32px 0', maxWidth: '100%' }}>
        <h2 className="landing-section-title" style={{ fontSize: '30px' }}>
          What's included
        </h2>
        <p className="landing-section-subtitle" style={{ fontSize: '15px' }}>
          Key features of the AegisSphere platform.
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
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '6px' }}>
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
