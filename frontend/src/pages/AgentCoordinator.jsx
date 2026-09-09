import React from 'react';
import {
  FileCode2,
  ShieldAlert,
  BrainCircuit,
  ShieldCheck,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

import Layout from '../components/common/Layout';
import StatusChip from '../components/common/StatusChip';
import '../styles/dashboard.css';

const AgentCoordinator = () => {
  const pipelineSteps = [
    {
      step: '01',
      name: 'Log Ingestion & Parsing',
      agent: 'Parser Agent',
      desc: 'Normalizes auth, web, and network logs into structured telemetry events.',
    },
    {
      step: '02',
      name: 'Signature & Rule Matching',
      agent: 'Classifier Agent',
      desc: 'Applies regex patterns, heuristic thresholds, and known attack vectors.',
    },
    {
      step: '03',
      name: 'MITRE ATT&CK Mapping',
      agent: 'Intel Agent',
      desc: 'Correlates suspicious behaviors to tactic pillars and technique IDs.',
    },
    {
      step: '04',
      name: 'Remediation Formulation',
      agent: 'Remediation Agent',
      desc: 'Generates firewall rules, host isolation directives, and audit logs.',
    },
  ];

  const agentCards = [
    {
      name: 'Log Parser Agent',
      icon: FileCode2,
      role: 'Ingestion & Normalization',
      purpose: 'Extracts structured JSON objects from raw SSH, Apache, Nginx, and syslog streams.',
      capabilities: [
        'Timestamp & IP tokenization',
        'Payload string normalization',
        'Malformed line handling',
      ],
      state: 'Ready',
      engine: 'Regex Ingestion Engine',
      iconBg: '#DBEAFE',
      iconColor: '#2563EB',
    },
    {
      name: 'Threat Classifier Agent',
      icon: ShieldAlert,
      role: 'Pattern Recognition',
      purpose: 'Evaluates event frequencies, brute-force bursts, SQL injection signatures, and anomalous request URIs.',
      capabilities: [
        'Heuristic severity scoring',
        'Brute-force clustering',
        'SQLi & XSS pattern matching',
      ],
      state: 'Ready',
      engine: 'ThreatAgent.js Heuristic Engine',
      iconBg: '#EDE9FE',
      iconColor: '#6366F1',
    },
    {
      name: 'Threat Intelligence Agent',
      icon: BrainCircuit,
      role: 'Contextual Correlation',
      purpose: 'Maps identified threat signatures against standard MITRE ATT&CK enterprise matrices and CVE indicators.',
      capabilities: [
        'ATT&CK technique tagging',
        'CVSS vulnerability scoring',
        'IOC categorization',
      ],
      state: 'Ready',
      engine: 'MITRE ATT&CK Reference Mapping',
      iconBg: '#E0F2FE',
      iconColor: '#0284C7',
    },
    {
      name: 'Remediation Agent',
      icon: ShieldCheck,
      role: 'Action Guidance',
      purpose: 'Suggests prescriptive containment actions, WAF blocking rules, and compliance summaries for security operators.',
      capabilities: [
        'Edge WAF block generation',
        'Host quarantine instructions',
        'SOC audit report formatting',
      ],
      state: 'Ready',
      engine: 'Remediation Playbooks',
      iconBg: '#DCFCE7',
      iconColor: '#15803D',
    },
  ];

  return (
    <Layout>
      <div className="soc-container">
        {/* Page Header */}
        <div className="soc-page-header">
          <div>
            <div className="soc-page-eyebrow">
              <Cpu size={13} style={{ display: 'inline', marginRight: 4 }} />
              SYSTEM ARCHITECTURE
            </div>
            <h1 className="soc-page-title">AI Agent Workflow & Architecture</h1>
            <p className="soc-page-subtitle">
              A modular 4-stage pipeline for log ingestion, heuristic threat detection, MITRE ATT&CK mapping, and remediation guidance.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                background: '#EDE9FE',
                color: '#6366F1',
                border: '1px solid #DDD6FE',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              Rule-based Engine Active
            </span>
          </div>
        </div>

        {/* 4-Stage Architecture Pipeline */}
        <div className="soc-table-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 className="soc-table-title" style={{ fontSize: '16px' }}>
              4-Stage Security Processing Pipeline
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Data flow from raw security log files to actionable containment playbooks.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            {pipelineSteps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #BFDBFE',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--accent-primary)',
                    }}
                  >
                    STEP {step.step}
                  </span>
                  <span
                    style={{
                      fontSize: '10.5px',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {step.agent}
                  </span>
                </div>
                <strong style={{ fontSize: '13.5px', color: 'var(--text-heading)' }}>
                  {step.name}
                </strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.45', margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Agent Profile Cards */}
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h3 className="soc-table-title" style={{ fontSize: '16px' }}>
              Specialized Agent Profiles
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Functional roles, capabilities, and underlying engine mechanisms for each agent component.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {agentCards.map((agent, idx) => {
              const Icon = agent.icon;
              return (
                <div
                  key={idx}
                  className="soc-stat-card"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: agent.iconBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: agent.iconColor,
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={20} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
                            {agent.name}
                          </h4>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {agent.role}
                          </span>
                        </div>
                      </div>

                      <span
                        style={{
                          background: '#EDE9FE',
                          color: '#6366F1',
                          border: '1px solid #DDD6FE',
                          padding: '3px 9px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        {agent.state}
                      </span>
                    </div>

                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.55', marginBottom: '14px' }}>
                      {agent.purpose}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {agent.capabilities.map((cap, cIdx) => (
                        <div
                          key={cIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '7px',
                            fontSize: '12px',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <CheckCircle2 size={13} style={{ color: agent.iconColor, flexShrink: 0 }} />
                          <span>{cap}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      paddingTop: '12px',
                      borderTop: '1px solid #BFDBFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <span>ENGINE</span>
                    <span style={{ color: 'var(--text-heading)', fontWeight: 600 }}>{agent.engine}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AgentCoordinator;
