import React from 'react';
import {
  FileCode2,
  ShieldAlert,
  BrainCircuit,
  ShieldCheck,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import '../../styles/landing.css';

const AgentsSection = () => {
  const agents = [
    {
      step: '01',
      name: 'Log Parser Agent',
      role: 'Ingestion & Tokenization',
      icon: FileCode2,
      desc: 'Normalizes and structures raw auth, web, firewall, and syslog lines into standardized telemetry events.',
      status: 'Ready',
      iconBg: '#E0F2FE',
      iconColor: '#0284C7',
    },
    {
      step: '02',
      name: 'Threat Classifier Agent',
      role: 'Heuristic Detection',
      icon: ShieldAlert,
      desc: 'Evaluates real-time event sequences against verified brute force thresholds and SQLi/XSS signatures.',
      status: 'Ready',
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
    },
    {
      step: '03',
      name: 'Threat Intelligence Agent',
      role: 'ATT&CK Correlation',
      icon: BrainCircuit,
      desc: 'Correlates identified threats directly with enterprise MITRE ATT&CK technique IDs and CVE indicators.',
      status: 'Ready',
      iconBg: '#EDE9FE',
      iconColor: '#7C3AED',
    },
    {
      step: '04',
      name: 'Remediation Agent',
      role: 'Guidance Playbooks',
      icon: ShieldCheck,
      desc: 'Synthesizes defensive guidance, edge firewall rules, and formatted incident summaries for operators.',
      status: 'Ready',
      iconBg: '#DCFCE7',
      iconColor: '#15803D',
    },
  ];

  return (
    <section id="agents" className="landing-section">
      <div className="landing-section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
            <Cpu size={18} />
          </div>
          <h2 className="landing-section-title" style={{ margin: 0 }}>
            AI Agent Workflow & Coordination
          </h2>
        </div>
        <p className="landing-section-subtitle">
          A synchronized 4-stage pipeline that processes raw log streams into structured security telemetry and verified remediations.
        </p>
      </div>

      <div className="landing-workflow-flow">
        {agents.map((agent, idx) => {
          const Icon = agent.icon;
          return (
            <div key={idx} className="landing-workflow-card">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: agent.iconBg,
                      color: agent.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    }}
                  >
                    <Icon size={22} />
                  </div>

                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#0284C7',
                      background: '#E0F2FE',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: '1px solid #BAE6FD',
                    }}
                  >
                    STAGE {agent.step}
                  </span>
                </div>

                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                  {agent.name}
                </h4>

                <span style={{ fontSize: '11px', color: '#0284C7', fontWeight: 700, display: 'block', marginBottom: '10px' }}>
                  {agent.role}
                </span>

                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.55', margin: 0 }}>
                  {agent.desc}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid rgba(186, 230, 253, 0.65)' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#DCFCE7',
                    border: '1px solid #BBF7D0',
                    color: '#15803D',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  <CheckCircle2 size={12} />
                  {agent.status}
                </span>

                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Active Engine
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AgentsSection;
