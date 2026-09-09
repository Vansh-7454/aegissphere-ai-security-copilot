import React from 'react';
import { CheckCircle2, XCircle, ShieldCheck, AlertOctagon } from 'lucide-react';
import '../../styles/landing.css';

const WhyAegisSphere = () => {
  const challenges = [
    'Manual log inspection across scattered CLI files is time-consuming',
    'Enterprise SIEM platforms have steep learning curves and heavy setup',
    'Threat intelligence references are often disconnected from raw logs',
    'Hard to test and verify attack signatures in a controlled manner',
    'Student projects often lack unified dashboards for incident review',
  ];

  const solutions = [
    'Centralized upload and analysis for multiple log formats',
    'Automated rule-based threat detection with immediate severity scores',
    'Integrated MITRE ATT&CK mapping directly linked to events',
    'Built-in Security Test Lab for safe signature simulation',
    'Clean, role-based dashboard for analysts and administrators',
  ];

  return (
    <section id="why" className="landing-section">
      <div className="landing-section-header" style={{ textAlign: 'left', margin: '0 0 32px 0', maxWidth: '100%' }}>
        <h2 className="landing-section-title" style={{ fontSize: '30px' }}>
          Why AegisSphere Was Built
        </h2>
        <p className="landing-section-subtitle" style={{ fontSize: '15px' }}>
          A focused platform addressing the challenges of manual log inspection and complex security monitoring tools.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Challenges */}
        <div className="landing-bento-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertOctagon size={18} style={{ color: 'var(--status-critical)' }} />
            <h3 style={{ fontSize: '16px', color: 'var(--text-heading)', margin: 0 }}>
              Common Challenges in Security Operations
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {challenges.map((pt, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <XCircle size={15} style={{ color: 'var(--status-critical)', flexShrink: 0, marginTop: '2px' }} />
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AegisSphere Solution */}
        <div className="landing-bento-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <ShieldCheck size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '16px', color: 'var(--text-heading)', margin: 0 }}>
              AegisSphere Solution & Focus
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {solutions.map((pt, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-primary)' }}>
                <CheckCircle2 size={15} style={{ color: 'var(--status-success)', flexShrink: 0, marginTop: '2px' }} />
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyAegisSphere;
