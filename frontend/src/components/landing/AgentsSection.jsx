import React from 'react';
import {
  FileCode2,
  ShieldAlert,
  BrainCircuit,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import '../../styles/landing.css';

const AgentsSection = () => {
  const agents = [
    {
      name: 'Log Parser Agent',
      icon: FileCode2,
      desc: 'Extract relevant information and structured tokens from uploaded logs.',
      status: 'Active',
      iconBg: '#DBEAFE',
      iconColor: '#2563EB',
    },
    {
      name: 'Threat Classifier Agent',
      icon: ShieldAlert,
      desc: 'Checks event streams for suspicious brute force, injection, and recon patterns.',
      status: 'Active',
      iconBg: '#EDE9FE',
      iconColor: '#6366F1',
    },
    {
      name: 'Threat Intelligence Agent',
      icon: BrainCircuit,
      desc: 'Provides additional context and maps signatures to MITRE ATT&CK techniques.',
      status: 'Active',
      iconBg: '#E0F2FE',
      iconColor: '#0284C7',
    },
    {
      name: 'Remediation Agent',
      icon: ShieldCheck,
      desc: 'Suggests practical mitigation actions, firewall rules, and SOC summary reports.',
      status: 'Active',
      iconBg: '#DCFCE7',
      iconColor: '#15803D',
    },
  ];

  return (
    <section id="agents" className="landing-section">
      <div className="landing-section-header" style={{ textAlign: 'left', margin: '0 0 32px 0', maxWidth: '100%' }}>
        <h2 className="landing-section-title" style={{ fontSize: '30px' }}>
          AI Agent Workflow
        </h2>
        <p className="landing-section-subtitle" style={{ fontSize: '15px' }}>
          AegisSphere uses separate agents for different parts of the security analysis process.
        </p>
      </div>

      <div className="landing-workflow-flow">
        {agents.map((agent, idx) => {
          const Icon = agent.icon;
          return (
            <div key={idx} className="landing-workflow-card">
              <div>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: agent.iconBg,
                    color: agent.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <Icon size={20} />
                </div>

                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '8px' }}>
                  {agent.name}
                </h4>

                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.55', margin: 0 }}>
                  {agent.desc}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#EDE9FE',
                    border: '1px solid #DDD6FE',
                    color: '#6366F1',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {agent.status}
                </span>

                {idx < agents.length - 1 && (
                  <span className="landing-workflow-arrow" style={{ display: 'none' }}>
                    <ArrowRight size={16} />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AgentsSection;
