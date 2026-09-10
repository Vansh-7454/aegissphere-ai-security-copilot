import React from 'react';
import {
  FileCode2,
  ShieldAlert,
  BrainCircuit,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

import Layout from '../components/common/Layout';
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
      state: 'Active',
      engine: 'Regex Ingestion Engine',
      iconBg: '#E0F2FE',
      iconColor: '#0284C7',
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
      state: 'Active',
      engine: 'ThreatAgent.js Heuristic Engine',
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
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
      state: 'Active',
      engine: 'MITRE ATT&CK Reference Mapping',
      iconBg: '#EDE9FE',
      iconColor: '#7C3AED',
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
      state: 'Active',
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
                background: '#E0F2FE',
                color: '#0284C7',
                border: '1px solid #BAE6FD',
                padding: '5px 14px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={13} />
              Rule-based Engine Active
            </span>
          </div>
        </div>

        {/* 4-Stage Architecture Pipeline */}
        <div className="soc-table-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '18px' }}>
            <h3 className="soc-table-title" style={{ fontSize: '16px', color: '#0F172A' }}>
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
                  background: '#F8FCFE',
                  border: '1px solid rgba(186, 230, 253, 0.8)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  position: 'relative',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#0284C7',
                      background: '#E0F2FE',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    STEP {step.step}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                    }}
                  >
                    {step.agent}
                  </span>
                </div>
                <strong style={{ fontSize: '14px', color: '#0F172A' }}>
                  {step.name}
                </strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Agent Profile Cards */}
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h3 className="soc-table-title" style={{ fontSize: '16px', color: '#0F172A' }}>
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
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: agent.iconBg,
                            border: `1px solid ${agent.iconColor}33`,
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
                          <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                            {agent.name}
                          </h4>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {agent.role}
                          </span>
                        </div>
                      </div>

                      <span
                        style={{
                          background: '#DCFCE7',
                          color: '#15803D',
                          border: '1px solid #BBF7D0',
                          padding: '3px 10px',
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {agent.capabilities.map((cap, cIdx) => (
                        <div
                          key={cIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px',
                            color: '#0F172A',
                          }}
                        >
                          <CheckCircle2 size={14} style={{ color: agent.iconColor, flexShrink: 0 }} />
                          <span>{cap}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      paddingTop: '14px',
                      borderTop: '1px solid rgba(186, 230, 253, 0.65)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <span style={{ fontWeight: 700, color: '#0284C7' }}>ENGINE</span>
                    <span style={{ color: '#0F172A', fontWeight: 700 }}>{agent.engine}</span>
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
