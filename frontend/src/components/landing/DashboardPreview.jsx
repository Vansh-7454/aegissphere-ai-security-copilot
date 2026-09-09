import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, ShieldAlert, Cpu, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import '../../styles/landing.css';

const trendData = [
  { time: '00:00', threats: 12 },
  { time: '04:00', threats: 19 },
  { time: '08:00', threats: 34 },
  { time: '12:00', threats: 48 },
  { time: '16:00', threats: 26 },
  { time: '20:00', threats: 41 },
];

const severityPieData = [
  { name: 'Critical', value: 3, color: '#EF4444' },
  { name: 'High', value: 6, color: '#F59E0B' },
  { name: 'Medium', value: 14, color: '#06B6D4' },
  { name: 'Low', value: 28, color: '#22C55E' },
];

const sampleDetections = [
  { type: 'SSH Brute Force', severity: 'Critical', confidence: 94.5, time: '19:42:10', status: 'MITIGATED' },
  { type: 'SQL Injection', severity: 'High', confidence: 89.2, time: '19:40:05', status: 'CONTAINED' },
  { type: 'Port Sweep Scan', severity: 'Medium', confidence: 88.0, time: '19:38:12', status: 'ACTIVE' },
  { type: 'Reflected XSS', severity: 'Low', confidence: 76.4, time: '19:35:48', status: 'RESOLVED' },
];

const DashboardPreview = () => {
  const [activeTab, setActiveTab] = useState('telemetry');

  const getSeverityStyle = (sev) => {
    switch (sev) {
      case 'Critical': return { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' };
      case 'High': return { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' };
      case 'Medium': return { color: '#06B6D4', bg: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)' };
      default: return { color: '#22C55E', bg: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' };
    }
  };

  return (
    <section id="showcase" className="landing-section section-bg-dark">
      <div className="section-header">
        <span className="badge-tag-lux">SOC Console Showcase</span>
        <h2 className="section-title">Live Enterprise Operations Showcase</h2>
        <p className="section-subtitle">
          Experience real-time threat telemetry, multi-agent classification, and instant forensic audit feeds.
        </p>
      </div>

      <motion.div
        className="showcase-container"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Top Header */}
        <div className="showcase-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={18} style={{ color: '#06B6D4' }} />
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#F8FAFC' }}>
              AegisSphere Platform Console v2.0
            </span>
          </div>

          <div className="showcase-tabs">
            <button
              className={`showcase-tab ${activeTab === 'telemetry' ? 'active' : ''}`}
              onClick={() => setActiveTab('telemetry')}
            >
              Telemetry & Timeline
            </button>
            <button
              className={`showcase-tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Severity Breakdown
            </button>
          </div>
        </div>

        {/* Showcase Content */}
        <div className="showcase-body">
          {/* Split Layout */}
          <div className="showcase-split-grid">
            {/* Left Column: Animated Charts & Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#0B1120', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#F8FAFC' }}>7-Day Threat Incidence Profile</span>
                  <span style={{ fontSize: '11px', color: '#06B6D4', fontWeight: '700' }}>Live Feed</span>
                </div>
                <div style={{ height: '180px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="showcaseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Area type="monotone" dataKey="threats" stroke="#6366F1" strokeWidth={2} fill="url(#showcaseGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Severity Breakdown Mini Pie */}
              {activeTab === 'analytics' && (
                <div style={{ background: '#0B1120', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '20px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#F8FAFC' }}>Severity Distribution Matrix</span>
                  <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={severityPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={4}>
                          {severityPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#1A2333', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#F8FAFC' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Detections Feed Table */}
            <div style={{ background: '#0B1120', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#F8FAFC' }}>Recent Detections Feed</span>
                <span style={{ fontSize: '11px', color: '#22C55E', fontWeight: '700' }}>AI Scanned</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sampleDetections.map((item, idx) => {
                  const sevStyle = getSeverityStyle(item.severity);
                  return (
                    <div key={idx} style={{ background: '#1A2333', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#F8FAFC' }}>{item.type}</div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>Time: {item.time}</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: sevStyle.color, background: sevStyle.bg, border: sevStyle.border, padding: '2px 8px', borderRadius: '4px' }}>
                          {item.severity}
                        </span>
                        <span style={{ fontSize: '11px', color: '#06B6D4', fontWeight: '700', fontFamily: 'monospace' }}>
                          {item.confidence}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default DashboardPreview;
