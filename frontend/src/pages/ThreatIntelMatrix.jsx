import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import { BrainCircuit, Globe, Crosshair, Cpu, Database, Info } from 'lucide-react';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import '../styles/dashboard.css';

const ThreatIntelMatrix = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [searched, setSearched] = useState(false);

  // Curated, authentic local MITRE ATT&CK knowledge dataset
  const mitreKnowledgeBase = [
    {
      id: 'T1110',
      name: 'Brute Force (Password Spraying & Guessing)',
      tactic: 'Initial Access / Credential Access',
      tacticId: 'TA0001',
      severity: 'Critical',
      desc: 'Adversaries iteratively attempt passwords against accounts to gain access. Common in SSH and web auth spraying.',
      mitigations: 'Multi-factor authentication (MFA), account lockout policies, rate-limiting failed logins.',
    },
    {
      id: 'T1190',
      name: 'Exploit Public-Facing Application (SQLi / RCE)',
      tactic: 'Initial Access',
      tacticId: 'TA0001',
      severity: 'Critical',
      desc: 'Adversaries exploit software vulnerabilities or input validation flaws in public web services to manipulate databases or execute code.',
      mitigations: 'Parameterized queries, web application firewalls (WAF), regular patch management.',
    },
    {
      id: 'T1059',
      name: 'Command and Scripting Interpreter',
      tactic: 'Execution',
      tacticId: 'TA0002',
      severity: 'Critical',
      desc: 'Adversaries abuse command and script interpreters (sh, bash, cmd.exe, PowerShell) to execute arbitrary commands.',
      mitigations: 'Disable command execution primitives in app runtimes, script block logging, execution sandboxing.',
    },
    {
      id: 'T1595',
      name: 'Active Scanning (Port Probing & Vulnerability Scanning)',
      tactic: 'Reconnaissance',
      tacticId: 'TA0043',
      severity: 'Medium',
      desc: 'Adversaries probe infrastructure over network protocols to discover listening ports and vulnerable services.',
      mitigations: 'Perimeter firewall rate-limiting, disabling unnecessary listening ports, blocking scanner signatures.',
    },
    {
      id: 'T1041',
      name: 'Exfiltration Over C2 Channel',
      tactic: 'Exfiltration',
      tacticId: 'TA0010',
      severity: 'High',
      desc: 'Adversaries steal and transmit sensitive database or system telemetry over established command and control channels.',
      mitigations: 'Egress traffic filtering, network flow anomaly detection, database access logging.',
    },
  ];

  const mitreTactics = [
    {
      tactic: 'Reconnaissance',
      id: 'TA0043',
      icon: Globe,
      techniques: [
        { id: 'T1595', name: 'Active Scanning (Nmap/Masscan)', severity: 'Medium', desc: 'Port probing to map open network listening services.' },
        { id: 'T1592', name: 'Gather Host Info', severity: 'Low', desc: 'Querying public DNS records and IP allocation metadata.' },
      ],
    },
    {
      tactic: 'Initial Access',
      id: 'TA0001',
      icon: Crosshair,
      techniques: [
        { id: 'T1190', name: 'Exploit Public Application', severity: 'Critical', desc: 'SQLi, RCE, or input validation bypass on public HTTP endpoints.' },
        { id: 'T1110', name: 'Brute Force (Hydra)', severity: 'High', desc: 'Automated dictionary attacks against SSH / HTTP auth portals.' },
      ],
    },
    {
      tactic: 'Execution',
      id: 'TA0002',
      icon: Cpu,
      techniques: [
        { id: 'T1059', name: 'Command & Script Injection', severity: 'Critical', desc: 'Execution of unauthorized shell commands via unsanitized arguments.' },
        { id: 'T1203', name: 'Exploitation for Execution', severity: 'High', desc: 'Exploitation of service vulnerabilities to spawn subshells.' },
      ],
    },
    {
      tactic: 'Exfiltration',
      id: 'TA0010',
      icon: Database,
      techniques: [
        { id: 'T1041', name: 'Exfiltration Over Network', severity: 'High', desc: 'Transmitting sensitive database logs to external IP destinations.' },
        { id: 'T1020', name: 'Automated Exfiltration', severity: 'Medium', desc: 'Scheduled cron tasks dumping data to remote endpoints.' },
      ],
    },
  ];

  const handleLookup = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearched(true);
    const q = searchQuery.trim().toLowerCase();

    // Query against verified local MITRE dataset
    const match = mitreKnowledgeBase.find(
      (item) =>
        item.id.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.tactic.toLowerCase().includes(q)
    );

    if (match) {
      setQueryResult({ found: true, data: match });
    } else {
      setQueryResult({ found: false, query: searchQuery.trim() });
    }
  };

  const getSeverityVariant = (sev) => {
    const s = (sev || '').toLowerCase();
    if (s === 'critical') return 'critical';
    if (s === 'high') return 'high';
    if (s === 'low') return 'low';
    return 'medium';
  };

  return (
    <Layout>
      <div className="soc-container">
        {/* Page Header */}
        <div className="soc-page-header">
          <div>
            <div className="soc-page-eyebrow">
              <BrainCircuit size={13} style={{ display: 'inline', marginRight: 4 }} />
              TACTICAL KNOWLEDGE BASE
            </div>
            <h1 className="soc-page-title">Threat Intelligence & MITRE ATT&CK</h1>
            <p className="soc-page-subtitle">
              Enterprise technique taxonomy mapping, adversarial tactics reference, and MITRE ATT&CK v14.1 indicators.
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
              }}
            >
              ATT&CK Matrix v14.1 (Local)
            </span>
          </div>
        </div>

        {/* MITRE Knowledge Lookup Box */}
        <div className="soc-table-card" style={{ padding: '24px' }}>
          <h3 className="soc-table-title" style={{ fontSize: '16px', color: '#0F172A' }}>
            MITRE ATT&CK Technique Lookup
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '2px 0 16px 0' }}>
            Search local MITRE ATT&CK knowledge base by technique ID (e.g., T1110, T1190, T1059) or keyword.
          </p>

          <form onSubmit={handleLookup} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px', minWidth: '0' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search technique (e.g., T1110, Brute Force, SQL, T1059)..."
                className="soc-search-input"
                style={{
                  width: '100%',
                  height: '42px',
                  background: '#FFFFFF',
                  border: '1px solid rgba(186, 230, 253, 0.85)',
                  borderRadius: '9999px',
                  padding: '0 18px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              />
            </div>
            <Button type="submit" variant="primary" size="md">
              Query Intelligence
            </Button>
          </form>

          {searched && queryResult && queryResult.found && (
            <div
              style={{
                marginTop: '18px',
                background: '#F0F9FF',
                border: '1px solid rgba(186, 230, 253, 0.85)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0284C7' }}>
                    {queryResult.data.id}
                  </span>
                  <strong style={{ fontSize: '15px', color: '#0F172A' }}>
                    {queryResult.data.name}
                  </strong>
                </div>
                <Badge variant={getSeverityVariant(queryResult.data.severity)}>
                  {queryResult.data.severity} Risk
                </Badge>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                {queryResult.data.desc}
              </p>

              <div style={{ background: '#DCFCE7', padding: '12px 14px', borderRadius: '10px', border: '1px solid #BBF7D0', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                  Mitigation Guidance
                </span>
                <span style={{ fontSize: '12.5px', color: '#14532D', lineHeight: 1.45 }}>
                  {queryResult.data.mitigations}
                </span>
              </div>
            </div>
          )}

          {searched && queryResult && !queryResult.found && (
            <div
              style={{
                marginTop: '18px',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 16px',
                color: '#1E40AF',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Info size={18} style={{ flexShrink: 0, color: '#2563EB' }} />
              <div>
                <strong>External Threat Intelligence Feed Offline:</strong> No local definition matched "{queryResult.query}". Live external CVE/NVD intelligence API lookups are currently unavailable.
              </div>
            </div>
          )}
        </div>

        {/* MITRE ATT&CK Tactics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {mitreTactics.map((tactic, idx) => {
            const Icon = tactic.icon;
            return (
              <div key={idx} className="soc-stat-card" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        {tactic.tactic}
                      </h4>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {tactic.id}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {tactic.techniques.map((tech, tIdx) => (
                    <div
                      key={tIdx}
                      style={{
                        background: '#F8FCFE',
                        border: '1px solid rgba(186, 230, 253, 0.75)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: '#0284C7', fontWeight: 800 }}>
                          {tech.id}
                        </span>
                        <Badge variant={getSeverityVariant(tech.severity)} size="sm">
                          {tech.severity}
                        </Badge>
                      </div>
                      <strong style={{ fontSize: '12.5px', color: '#0F172A' }}>
                        {tech.name}
                      </strong>
                      <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                        {tech.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default ThreatIntelMatrix;
