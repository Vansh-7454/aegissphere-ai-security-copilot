import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

import Layout from '../components/common/Layout';
import Badge from '../components/common/Badge';
import api from '../services/api';
import '../styles/securityTestLab.css';
import '../styles/dashboard.css';

const attackScenarios = [
  {
    name: 'SQL Injection',
    tag: 'Web Test',
    tagBg: '#EDE9FE',
    tagColor: '#7C3AED',
    tagBorder: '#DDD6FE',
    risk: 'Critical',
    desc: 'Simulates SQL injection syntax patterns against web application endpoints.',
  },
  {
    name: 'XSS',
    tag: 'Application Test',
    tagBg: '#E0F2FE',
    tagColor: '#0284C7',
    tagBorder: '#BAE6FD',
    risk: 'Medium',
    desc: 'Simulates malicious script tag injection payloads targeting client sessions.',
  },
  {
    name: 'Brute Force',
    tag: 'Network Test',
    tagBg: '#FEF3C7',
    tagColor: '#D97706',
    tagBorder: '#FDE68A',
    risk: 'High',
    desc: 'Simulates rapid repeated SSH login authentication failures from a single IP address.',
  },
  {
    name: 'Port Scanning',
    tag: 'Port Test',
    tagBg: '#CCFBF1',
    tagColor: '#0D9488',
    tagBorder: '#99F6E4',
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
                background: 'linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
              }}
            >
              <FlaskConical size={22} />
            </div>
            <div>
              <h1 className="soc-page-title" style={{ fontSize: '24px', margin: 0 }}>Security Test Lab</h1>
              <p className="soc-page-subtitle" style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Use controlled test cases to evaluate how the ThreatAgent engine handles common security threats.
              </p>
            </div>
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
              Controlled Sandbox Active
            </span>
          </div>
        </div>

        {/* 4 Quick Test Cards in 2x2 Grid with Proper Measurements */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
          {attackScenarios.map((sc, idx) => (
            <div key={idx} className="soc-stat-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {sc.name}
                  </h3>
                  <span
                    style={{
                      background: sc.tagBg,
                      color: sc.tagColor,
                      border: `1px solid ${sc.tagBorder}`,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {sc.tag}
                  </span>
                </div>
                <Badge variant={getSeverityVariant(sc.risk)} size="sm">{sc.risk}</Badge>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.55', margin: '0 0 16px 0' }}>
                {sc.desc}
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => runTest(sc.name)}
                  disabled={loading}
                  className="aegis-btn aegis-btn-primary aegis-btn-sm"
                  style={{ gap: '6px' }}
                >
                  <Play size={12} />
                  {loading && selectedAttack === sc.name ? 'Evaluating...' : 'Generate Test'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Simulation Execution Output & Audit Card */}
        <div className="testlab-result-card" style={{ background: '#FFFFFF', border: '1px solid rgba(186, 230, 253, 0.85)', padding: '26px' }}>
          <h3 className="testlab-card-title">Test Execution Output & Heuristic Evaluation</h3>

          {error && (
            <div
              style={{
                background: '#FEE2E2',
                border: '1px solid #FCA5A5',
                borderRadius: '10px',
                padding: '12px 16px',
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
              <FlaskConical size={40} style={{ color: '#0284C7', opacity: 0.6 }} />
              <div>
                <strong style={{ fontSize: '15px', color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                  No Active Test Running
                </strong>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
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
                  <strong style={{ color: '#0284C7', fontFamily: 'var(--font-mono)' }}>
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
                <div style={{ background: '#EFF6FF', padding: '12px 16px', borderRadius: '10px', border: '1px solid #BFDBFE', fontSize: '12.5px', color: '#1E40AF' }}>
                  <strong>Scoring Reason:</strong> {result.threat.confidenceReason}
                </div>
              )}

              <div className="testlab-notice-box">
                <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#0284C7' }} />
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