import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';
import {
  ShieldAlert,
  Search,
  RefreshCw,
  Globe,
  Binary,
  Layers,
  Activity,
  AlertCircle,
} from 'lucide-react';
import '../../styles/admin.css';

const AdminThreats = () => {
  const [threats, setThreats] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchThreats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/threats', {
        params: {
          severity: severityFilter,
          search: search.trim() || undefined,
        },
      });
      if (response.data?.success) {
        setThreats(response.data.threats || []);
        setAnalytics(response.data.analytics || null);
      }
    } catch (err) {
      console.error('Failed to load platform threats:', err);
      setError(err.response?.data?.message || 'Failed to load threat analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreats();
  }, [severityFilter, search]);

  return (
    <AdminLayout>
      <div className="admin-card" style={{ marginBottom: '20px' }}>
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              <ShieldAlert size={20} style={{ color: '#DC2626' }} />
              Platform-Wide Threat Forensics & Analytics
            </h2>
            <p className="admin-card-desc">
              Aggregated threat detections across all operator ingestions, mapped to MITRE ATT&CK taxonomy
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="soc-search-container" style={{ width: '260px' }}>
              <Search size={14} className="soc-search-icon" />
              <input
                type="text"
                className="soc-search-input"
                placeholder="Search by threat, MITRE, IP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="aegis-select"
              style={{ padding: '8px 12px', borderRadius: 'var(--radius-pill)', border: '1px solid #BAE6FD', fontSize: '12.5px', background: '#FFFFFF' }}
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <button
              onClick={fetchThreats}
              disabled={loading}
              className="aegis-btn aegis-btn-secondary aegis-btn-sm"
            >
              <RefreshCw size={13} className={loading ? 'aegis-btn-spinner' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: '#DC2626', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* Threat Analytics Distribution Cards */}
        {analytics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            <div style={{ background: '#F8FCFE', border: '1px solid #BAE6FD', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: '#0369A1', marginBottom: '10px' }}>
                <Globe size={15} /> Top Attacker Source IPs
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {analytics.topSourceIps?.length > 0 ? (
                  analytics.topSourceIps.slice(0, 4).map((ip) => (
                    <div key={ip.ip} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0F172A' }}>{ip.ip}</span>
                      <span className={`admin-badge admin-badge-${(ip.maxSeverity || 'medium').toLowerCase()}`}>{ip.count} hits</span>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>No external IPs logged.</span>
                )}
              </div>
            </div>

            <div style={{ background: '#F8FCFE', border: '1px solid #BAE6FD', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: '#0369A1', marginBottom: '10px' }}>
                <Binary size={15} /> MITRE ATT&CK Techniques
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {analytics.mitreTechniques?.length > 0 ? (
                  analytics.mitreTechniques.slice(0, 4).map((m) => (
                    <div key={m.technique} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0284C7' }}>{m.technique}</span>
                      <span style={{ fontWeight: 600, color: '#475569' }}>{m.count} instance(s)</span>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>No MITRE techniques mapped.</span>
                )}
              </div>
            </div>

            <div style={{ background: '#F8FCFE', border: '1px solid #BAE6FD', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: '#0369A1', marginBottom: '10px' }}>
                <Layers size={15} /> Attack Categories
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {analytics.threatTypes?.length > 0 ? (
                  analytics.threatTypes.slice(0, 4).map((t) => (
                    <div key={t.type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ fontWeight: 600, color: '#0F172A' }}>{t.type}</span>
                      <span style={{ fontWeight: 700, color: '#0369A1' }}>{t.count}</span>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>No threat types identified.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Threats Table */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Threat Signature</th>
                <th>Severity</th>
                <th>Confidence</th>
                <th>MITRE Technique</th>
                <th>Source IP</th>
                <th>Associated Log File</th>
                <th>Status</th>
                <th>Detected At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                    Loading platform threats from database...
                  </td>
                </tr>
              ) : threats.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                    No security threats matching criteria.
                  </td>
                </tr>
              ) : (
                threats.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, color: '#0F172A' }}>{t.threatType}</span>
                        <span style={{ fontSize: '11.5px', color: '#64748B', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {t.description || 'No description recorded.'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge admin-badge-${(t.severity || 'low').toLowerCase()}`}>
                        {t.severity}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0284C7' }}>
                      {t.confidence}%
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0369A1' }}>
                      {t.mitreTechnique || 'T1059'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {t.sourceIp || 'Internal Telemetry'}
                    </td>
                    <td style={{ fontSize: '12px', color: '#0F172A' }}>
                      {t.logId?.originalName || t.logId?.filename || 'System Generated'}
                    </td>
                    <td>
                      <span className={`admin-badge ${t.status === 'Mitigated' || t.status === 'Resolved' ? 'admin-badge-active' : 'admin-badge-high'}`}>
                        {t.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748B' }}>
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminThreats;
