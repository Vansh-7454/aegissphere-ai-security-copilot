import React from 'react';
import { ShieldCheck, Lock, Award, Server, Cpu } from 'lucide-react';
import '../../styles/landing.css';

const TrustedBySection = () => {
  const complianceStandards = [
    { name: 'SOC 2 Type II Certified', icon: ShieldCheck },
    { name: 'ISO 27001 Compliance', icon: Award },
    { name: 'GDPR & Privacy Shield', icon: Lock },
    { name: 'NIST CSF Framework', icon: Server },
    { name: 'Zero-Trust Telemetry', icon: Cpu },
  ];

  return (
    <section className="trusted-section">
      <div className="trusted-label">Built for Enterprise SOC Compliance & Data Privacy</div>
      <div className="trusted-grid">
        {complianceStandards.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="trusted-chip">
              <Icon size={16} style={{ color: '#2563EB' }} />
              <span>{item.name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TrustedBySection;
