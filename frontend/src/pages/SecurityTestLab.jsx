import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  Zap,
} from 'lucide-react';

import Layout from '../components/common/Layout';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import api from '../services/api';
import '../styles/securityTestLab.css';
import '../styles/dashboard.css';

const attackScenarios = [
  {
    name: 'SQL Injection',
    tag: 'Web Test',
    risk: 'Critical',
    desc: 'Simulates SQL injection syntax patterns against web application endpoints.',
  },
  {
    name: 'XSS',
    tag: 'Malware Test',
    risk: 'Medium',
    desc: 'Simulates malicious script tag injection payloads targeting client sessions.',
  },
  {
    name: 'Brute Force',
    tag: 'Network Test',
    risk: 'High',
    desc: 'Simulates rapid repeated SSH login authentication failures from a single IP address.',
  },
  {
    name: 'Port Scanning',
    tag: 'Port Test',
    risk: 'Medium',
    desc: 'Simulates SYN/TCP sequential port probe reconnaissance across multiple service ports.',
  },
];

export default function SecurityTestLab() {
  const [selectedAttack, setSelectedAttack] = useState('SQL Injection');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const runTest = async (type) => {
    const attackType = type || selectedAttack;
    setSelectedAttack(attackType);
    try {
      setLoading(true);
      setResult(null);
      setError('');

      const response = await api.post('/attack-tests/generate', {
        attackType,
      });

      setResult(response.data);
    } catch (err) {
      console.error('Security test error:', err);
      setError(
        err.response?.data?.message || 'Failed to execute security test simulation on server.'
      );
    } finally {
      setLoading(false);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#6366F1',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
              }}
            >
              <FlaskConical size={22} />
            </div>
            <div>
              <h1 className="soc-page-title" style={{ fontSize: '24px', margin: 0 }}>Security Test Lab</h1>
              <p className="soc-page-subtitle" style={{ fontSize: '13.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                Use controlled test cases to evaluate how the ThreatAgent engine handles common security threats.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                background: '#E2EEFE',
                color: '#1E40AF',
                border: '1px solid #BFDBFE',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              Controlled Sandbox
            </span>
          </div>
        </div>

        {/* 4 Quick Test Cards in 2x2 Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {attackScenarios.map((sc, idx) => (
            <div key={idx} className="soc-stat-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                    {sc.name}
                  </h3>
                  <span
                    style={{
                      background: '#EDE9FE',
                      color: '#6366F1',
                      border: '1px solid #DDD6FE',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '10.5px',
                      fontWeight: 600,
                    }}
                  >
                    {sc.tag}
                  </span>
                </div>
                <Badge variant={getSeverityVariant(sc.risk)} size="sm">{sc.risk}</Badge>
              </div>

              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                {sc.desc}
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => runTest(sc.name)}
                  disabled={loading}
                  className="aegis-btn aegis-btn-primary aegis-btn-sm"
                >
                  <Play size={12} />
                  {loading && selectedAttack === sc.name ? 'Evaluating...' : 'Generate Test'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Simulation Execution Output & Audit Card */}
        <div className="testlab-result-card">
          <h3 className="testlab-card-title">Test Execution Output & Heuristic Evaluation</h3>

          {error && (
            <div
              style={{
                background: 'var(--status-critical-bg)',
                border: '1px solid var(--status-critical-border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                color: '#DC2626',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {!result && !error && (
            <div className="testlab-result-empty">
              <FlaskConical size={36} style={{ color: '#2563EB', opacity: 0.6 }} />
              <div>
                <strong style={{ fontSize: '14px', color: 'var(--text-heading)', display: 'block' }}>
                  No Active Test Running
                </strong>
                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  Click "Generate Test" on any scenario above to trigger a synthetic event through the detection pipeline.
                </span>
              </div>
            </div>
          )}

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="testlab-result-header">
                <CheckCircle2 size={16} />
                <span>Simulation Parsed & Detected: {result.threat?.threatType || result.test?.attackType || selectedAttack}</span>
              </div>

              <div className="testlab-result-grid">
                <div className="testlab-result-cell">
                  <span>Attack Vector</span>
                  <strong>{result.threat?.threatType || result.test?.attackType || selectedAttack}</strong>
                </div>

                <div className="testlab-result-cell">
                  <span>Simulated Source IP</span>
                  <strong style={{ color: '#2563EB', fontFamily: 'var(--font-mono)' }}>
                    {result.threat?.sourceIp || 'Not available in log'}
                  </strong>
                </div>

                <div className="testlab-result-cell">
                  <span>Calculated Confidence</span>
                  <strong>{result.threat?.confidence !== undefined ? `${result.threat.confidence}%` : 'N/A'}</strong>
                </div>

                <div className="testlab-result-cell">
                  <span>Detection Severity</span>
                  <div>
                    <Badge variant={getSeverityVariant(result.threat?.severity || 'High')}>
                      {result.threat?.severity || 'High'}
                    </Badge>
                  </div>
                </div>
              </div>

              {result.threat?.confidenceReason && (
                <div style={{ background: '#EFF6FF', padding: '12px 16px', borderRadius: '8px', border: '1px solid #BFDBFE', fontSize: '12.5px', color: '#1E3A8A' }}>
                  <strong>Scoring Reason:</strong> {result.threat.confidenceReason}
                </div>
              )}

              <div className="testlab-notice-box">
                <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  The synthetic test telemetry has been processed through the ThreatAgent pipeline and stored in MongoDB. You can inspect the correlated events in Threat Forensics and Incident Response.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}