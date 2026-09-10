import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/common/Layout';
import { Settings, User, ShieldCheck, Cpu, Database, FileText, BrainCircuit, LogOut, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import '../styles/dashboard.css';

const SystemSettings = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [aiStatus, setAiStatus] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const fetchAiStatus = async () => {
      try {
        setLoadingAi(true);
        const res = await api.get('/ai/status');
        if (res.data) {
          setAiStatus(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch AI status:', err);
      } finally {
        setLoadingAi(false);
      }
    };
    fetchAiStatus();
  }, []);

  const tabs = [
    { id: 'profile', label: 'Operator Profile & Session', icon: User },
    { id: 'system', label: 'SOC Architecture & Directives', icon: Cpu },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Active Session';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <Layout>
      <div className="soc-container">
        {/* Page Header */}
        <div className="soc-page-header">
          <div>
            <div className="soc-page-eyebrow">
              <Settings size={13} style={{ display: 'inline', marginRight: 4 }} />
              SYSTEM & SETTINGS
            </div>
            <h1 className="soc-page-title">System & Operator Settings</h1>
            <p className="soc-page-subtitle">
              Review operator identity, active authentication session, and SOC engine architecture status.
            </p>
          </div>

          <span
            style={{
              background: '#E0F2FE',
              color: '#0284C7',
              border: '1px solid #BAE6FD',
              padding: '4px 14px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            Role: {user?.role || 'Security Analyst'}
          </span>
        </div>

        {/* Tab Selection Bar */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid rgba(186, 230, 253, 0.75)',
            borderRadius: 'var(--radius-xl)',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
          }}
        >
          <div className="forensics-filter-group">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`forensics-filter-btn ${activeTab === tab.id ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 18px' }}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Cards */}
        <div className="soc-table-card" style={{ padding: '28px' }}>
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '680px' }}>
              <div>
                <h3 className="soc-table-title" style={{ fontSize: '16px', color: '#0F172A' }}>Operator Identity & Authentication</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Authenticated operator credentials and personal SOC workspace parameters.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div style={{ background: '#F8FCFE', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(186, 230, 253, 0.75)' }}>
                  <span style={{ fontSize: '10.5px', color: '#0284C7', fontWeight: 700, display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Operator Name</span>
                  <strong style={{ fontSize: '14px', color: '#0F172A', marginTop: '4px', display: 'block' }}>{user?.name || 'Security Operator'}</strong>
                </div>

                <div style={{ background: '#F8FCFE', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(186, 230, 253, 0.75)' }}>
                  <span style={{ fontSize: '10.5px', color: '#0284C7', fontWeight: 700, display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Work Email</span>
                  <strong style={{ fontSize: '14px', color: '#0F172A', marginTop: '4px', display: 'block' }}>{user?.email || 'operator@aegissphere.io'}</strong>
                </div>

                <div style={{ background: '#F8FCFE', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(186, 230, 253, 0.75)' }}>
                  <span style={{ fontSize: '10.5px', color: '#0284C7', fontWeight: 700, display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Assigned Role</span>
                  <strong style={{ fontSize: '14px', color: '#0284C7', marginTop: '4px', display: 'block' }}>{user?.role || 'Security Analyst'}</strong>
                </div>

                <div style={{ background: '#F8FCFE', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(186, 230, 253, 0.75)' }}>
                  <span style={{ fontSize: '10.5px', color: '#0284C7', fontWeight: 700, display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Operator Identifier</span>
                  <strong style={{ fontSize: '12.5px', fontFamily: 'var(--font-mono)', color: '#64748B', marginTop: '4px', display: 'block' }}>
                    {user?._id || user?.id || 'ANALYST-ACTIVE'}
                  </strong>
                </div>
              </div>

              {/* Session Security Details */}
              <div style={{ background: '#EFF6FF', padding: '18px', borderRadius: '12px', border: '1px solid #BFDBFE', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} style={{ color: '#15803D' }} />
                  <strong style={{ fontSize: '13.5px', color: '#0F172A' }}>Active JWT Authentication Session</strong>
                </div>
                <p style={{ fontSize: '12.5px', color: '#1E3A8A', margin: 0, lineHeight: 1.55 }}>
                  Signed cryptographic JWT token verified on every API request. User-specific personal SOC telemetry boundary is enforced across all endpoints.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px 18px', fontSize: '11.5px', color: '#1E40AF', paddingTop: '4px' }}>
                  <span>Token Lifecycle: <strong>7 Days (Standard SOC Rotation)</strong></span>
                  <span>Registered: <strong>{formatDate(user?.createdAt)}</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '6px' }}>
                <button
                  onClick={logout}
                  className="aegis-btn aegis-btn-secondary aegis-btn-md"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', borderColor: '#FECACA', background: '#FEF2F2' }}
                >
                  <LogOut size={14} />
                  Sign Out of Session
                </button>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '720px' }}>
              <div>
                <h3 className="soc-table-title" style={{ fontSize: '16px', color: '#0F172A' }}>AegisSphere SOC Engine Architecture</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Operational configuration and live component telemetry of the AegisSphere platform.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Component 1: Multi-Agent Mesh */}
                <div style={{ background: '#F8FCFE', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(186, 230, 253, 0.75)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '0', flex: '1 1 240px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Cpu size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block' }}>Deterministic 4-Agent Security Pipeline</strong>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>LogParserAgent → ThreatClassifierAgent → ThreatIntelligenceAgent → RemediationAgent</span>
                    </div>
                  </div>
                  <span style={{ background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700 }}>
                    Active (4 Agents)
                  </span>
                </div>

                {/* Component 2: User Isolation */}
                <div style={{ background: '#F8FCFE', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(186, 230, 253, 0.75)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '0', flex: '1 1 240px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block' }}>Personal SOC Data Isolation</strong>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>Zero cross-user data leakage, strict query scoping & IDOR prevention</span>
                    </div>
                  </div>
                  <span style={{ background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700 }}>
                    Enforced
                  </span>
                </div>

                {/* Component 3: Google Gemini AI Advisory Service */}
                <div style={{ background: '#F8FCFE', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(186, 230, 253, 0.75)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '0', flex: '1 1 240px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BrainCircuit size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block' }}>Gemini AI Advisory Layer</strong>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                        {aiStatus?.service || 'Google Gemini'} ({aiStatus?.model || 'gemini-2.5-flash'}) — Contextual reasoning & investigation advisory
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      background: aiStatus?.configured ? '#DCFCE7' : '#FEF3C7',
                      color: aiStatus?.configured ? '#15803D' : '#D97706',
                      border: aiStatus?.configured ? '1px solid #BBF7D0' : '1px solid #FDE68A',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {loadingAi ? 'Checking...' : aiStatus?.configured ? 'Online' : 'Standby'}
                  </span>
                </div>

                {/* Component 4: MongoDB Persistence */}
                <div style={{ background: '#F8FCFE', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(186, 230, 253, 0.75)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '0', flex: '1 1 240px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Database size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block' }}>MongoDB Document Store</strong>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>Relational integrity across Logs, Threats, Incidents, and Reports</span>
                    </div>
                  </div>
                  <span style={{ background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700 }}>
                    Connected
                  </span>
                </div>

                {/* Component 5: PDF Reports Engine */}
                <div style={{ background: '#F8FCFE', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(186, 230, 253, 0.75)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '0', flex: '1 1 240px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block' }}>PDFKit SOC Report Generator</strong>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>Server-side binary streaming with dynamic y-flow layout & zero overlap</span>
                    </div>
                  </div>
                  <span style={{ background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700 }}>
                    Active
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SystemSettings;
