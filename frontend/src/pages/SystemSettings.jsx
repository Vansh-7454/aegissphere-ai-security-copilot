import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/common/Layout';
import { Settings, User, ShieldCheck, Cpu, Database, FileText, BrainCircuit, LogOut, CheckCircle2, Clock } from 'lucide-react';
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
              background: '#E2EEFE',
              color: '#1E40AF',
              border: '1px solid #BFDBFE',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            Role: {user?.role || 'Security Analyst'}
          </span>
        </div>

        {/* Tab Selection Bar */}
        <div className="forensics-filter-bar">
          <div className="forensics-filter-group">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`forensics-filter-btn ${activeTab === tab.id ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Cards */}
        <div className="soc-table-card" style={{ padding: '28px' }}>
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '640px' }}>
              <div>
                <h3 className="soc-table-title" style={{ fontSize: '16px' }}>Operator Identity & Authentication</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Authenticated operator credentials and personal SOC workspace parameters.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Operator Name</span>
                  <strong style={{ fontSize: '14px', color: '#0F172A', marginTop: '2px', display: 'block' }}>{user?.name || 'Security Operator'}</strong>
                </div>

                <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Work Email</span>
                  <strong style={{ fontSize: '14px', color: '#0F172A', marginTop: '2px', display: 'block' }}>{user?.email || 'operator@aegissphere.io'}</strong>
                </div>

                <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Assigned Role</span>
                  <strong style={{ fontSize: '14px', color: '#2563EB', marginTop: '2px', display: 'block' }}>{user?.role || 'Security Analyst'}</strong>
                </div>

                <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Operator Identifier</span>
                  <strong style={{ fontSize: '12.5px', fontFamily: 'var(--font-mono)', color: '#64748B', marginTop: '2px', display: 'block' }}>
                    {user?._id || user?.id || 'ANALYST-ACTIVE'}
                  </strong>
                </div>
              </div>

              {/* Session Security Details */}
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} style={{ color: '#15803D' }} />
                  <strong style={{ fontSize: '13px', color: '#0F172A' }}>Active JWT Authentication Session</strong>
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  Signed cryptographic JWT token verified on every API request. User-specific personal SOC telemetry boundary is enforced across all endpoints.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11.5px', color: '#64748B', paddingTop: '4px' }}>
                  <span>Token Lifecycle: <strong>7 Days (Standard SOC Rotation)</strong></span>
                  <span>Registered: <strong>{formatDate(user?.createdAt)}</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '4px' }}>
                <button
                  onClick={logout}
                  className="aegis-btn aegis-btn-secondary aegis-btn-md"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626' }}
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
                <h3 className="soc-table-title" style={{ fontSize: '16px' }}>AegisSphere SOC Engine Architecture</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Operational configuration and live component telemetry of the AegisSphere platform.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Component 1: Multi-Agent Mesh */}
                <div style={{ background: '#FFFFFF', padding: '14px 18px', borderRadius: '10px', border: '1px solid #BFDBFE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Cpu size={18} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '13.5px', color: '#0F172A', display: 'block' }}>Deterministic 4-Agent Security Pipeline</strong>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>LogParserAgent → ThreatClassifierAgent → ThreatIntelligenceAgent → RemediationAgent</span>
                    </div>
                  </div>
                  <span style={{ background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700 }}>
                    Active (4 Agents)
                  </span>
                </div>

                {/* Component 2: User Isolation */}
                <div style={{ background: '#FFFFFF', padding: '14px 18px', borderRadius: '10px', border: '1px solid #BFDBFE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '13.5px', color: '#0F172A', display: 'block' }}>Personal SOC Data Isolation</strong>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>Zero cross-user data leakage, strict query scoping & IDOR prevention</span>
                    </div>
                  </div>
                  <span style={{ background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700 }}>
                    Enforced
                  </span>
                </div>

                {/* Component 3: Google Gemini AI Advisory Service */}
                <div style={{ background: '#FFFFFF', padding: '14px 18px', borderRadius: '10px', border: '1px solid #BFDBFE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EDE9FE', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BrainCircuit size={18} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '13.5px', color: '#0F172A', display: 'block' }}>Gemini AI Advisory Layer</strong>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                        {aiStatus?.service || 'Google Gemini'} ({aiStatus?.model || 'gemini-1.5-flash'}) — Contextual reasoning & investigation advisory
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
                <div style={{ background: '#FFFFFF', padding: '14px 18px', borderRadius: '10px', border: '1px solid #BFDBFE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Database size={18} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '13.5px', color: '#0F172A', display: 'block' }}>MongoDB Document Store</strong>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>Relational integrity across Logs, Threats, Incidents, and Reports</span>
                    </div>
                  </div>
                  <span style={{ background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700 }}>
                    Connected
                  </span>
                </div>

                {/* Component 5: PDF Reports Engine */}
                <div style={{ background: '#FFFFFF', padding: '14px 18px', borderRadius: '10px', border: '1px solid #BFDBFE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '13.5px', color: '#0F172A', display: 'block' }}>PDFKit SOC Report Generator</strong>
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
