import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, ShieldAlert, Cpu, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import '../../styles/landing.css';

const defaultTrend = [
  { time: 'Day 1', threats: 0 },
  { time: 'Day 2', threats: 0 },
  { time: 'Day 3', threats: 0 },
  { time: 'Day 4', threats: 0 },
  { time: 'Day 5', threats: 0 },
  { time: 'Day 6', threats: 0 },
  { time: 'Today', threats: 0 },
];

const defaultSeverity = [
  { name: 'Critical', value: 0, color: '#EF4444' },
  { name: 'High', value: 0, color: '#F59E0B' },
  { name: 'Medium', value: 0, color: '#06B6D4' },
  { name: 'Low', value: 0, color: '#22C55E' },
];

const DashboardPreview = () => {
  const [activeTab, setActiveTab] = useState('telemetry');
  const [trendData, setTrendData] = useState(defaultTrend);
  const [severityPieData, setSeverityPieData] = useState(defaultSeverity);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchRealData = async () => {
      try {
        const res = await api.get('/auth/platform-preview');
        if (res.data?.success && isMounted) {
          if (Array.isArray(res.data.trendData) && res.data.trendData.length > 0) {
            setTrendData(res.data.trendData);
          }
          if (Array.isArray(res.data.severityBreakdown)) {
            setSeverityPieData(res.data.severityBreakdown);
          }
          if (Array.isArray(res.data.recentThreats)) {
            setDetections(res.data.recentThreats);
          }
        }
      } catch (err) {
        console.warn('Failed to load showcase data:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRealData();
    const timer = setInterval(fetchRealData, 15000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  const getSeverityStyle = (sev) => {
    switch (sev) {
      case 'Critical':
      case 'critical':
        return { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' };
      case 'High':
      case 'high':
        return { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' };
      case 'Medium':
      case 'medium':
        return { color: '#06B6D4', bg: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)' };
      default:
        return { color: '#22C55E', bg: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' };
    }
  };

  return (
    <section id="showcase" className="landing-section section-bg-dark">
      <div className="section-header">
        <span className="badge-tag-lux">Real-Time SOC Telemetry</span>
        <h2 className="section-title">Live Enterprise Operations Showcase</h2>
        <p className="section-subtitle">
          Experience live real-time threat telemetry, multi-agent classification, and forensic feeds from MongoDB.
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
              AegisSphere Platform Telemetry (Live Production)
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
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#F8FAFC' }}>7-Day Platform Threat Trend</span>
                  <span style={{ fontSize: '11px', color: '#06B6D4', fontWeight: '700' }}>Live Data</span>
                </div>
                <div style={{ height: '180px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="showcaseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284C7" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#0284C7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                      <Area type="monotone" dataKey="threats" stroke="#0284C7" strokeWidth={2} fill="url(#showcaseGradient)" />
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
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#F8FAFC' }}>Recent Platform Threats</span>
                <span style={{ fontSize: '11px', color: '#22C55E', fontWeight: '700' }}>AI Scanned</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {detections.length > 0 ? (
                  detections.map((item, idx) => {
                    const sevStyle = getSeverityStyle(item.severity || item.sev);
                    return (
                      <div key={item.id || idx} style={{ background: '#1A2333', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#F8FAFC' }}>{item.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>IP: {item.ip} • {item.time}</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: sevStyle.color, background: sevStyle.bg, border: sevStyle.border, padding: '2px 8px', borderRadius: '4px' }}>
                            {item.severity}
                          </span>
                          <span style={{ fontSize: '11px', color: '#06B6D4', fontWeight: '700', fontFamily: 'monospace' }}>
                            {item.confidence || 92.5}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#64748B', fontSize: '12px' }}>
                    {loading ? 'Fetching live security telemetry...' : 'No detections recorded yet.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default DashboardPreview;
