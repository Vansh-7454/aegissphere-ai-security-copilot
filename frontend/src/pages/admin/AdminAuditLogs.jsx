import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';
import {
  History,
  RefreshCw,
  Search,
  ShieldCheck,
  Calendar,
  Globe,
  User,
  Activity,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import '../../styles/admin.css';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [actionTypes, setActionTypes] = useState([]);
  const [selectedAction, setSelectedAction] = useState('All');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/audit-logs', {
        params: {
          action: selectedAction,
          limit: 50,
        },
      });
      if (response.data?.success) {
        setLogs(response.data.auditLogs || []);
        setActionTypes(response.data.actionTypes || []);
      }
    } catch (err) {
      console.error('Failed to load audit trail:', err);
      setError(err.response?.data?.message || 'Failed to fetch administrative audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [selectedAction]);

  const filteredLogs = logs.filter((log) => {
    const term = search.toLowerCase();
    return (
      (log.action || '').toLowerCase().includes(term) ||
      (log.actorEmail || '').toLowerCase().includes(term) ||
      (log.ipAddress || '').toLowerCase().includes(term) ||
      (log.targetType || '').toLowerCase().includes(term)
    );
  });

  return (
    <AdminLayout>
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              <History size={20} style={{ color: '#0284C7' }} />
              Administrative Audit Trail
            </h2>
            <p className="admin-card-desc">
              Immutable record of administrative operations, logins, user status updates, and elevated actions
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="soc-search-container" style={{ width: '240px' }}>
              <Search size={14} className="soc-search-icon" />
              <input
                type="text"
                className="soc-search-input"
                placeholder="Search actor, action, IP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="aegis-select"
              style={{ padding: '8px 12px', borderRadius: 'var(--radius-pill)', border: '1px solid #BAE6FD', fontSize: '12.5px', background: '#FFFFFF' }}
            >
              <option value="All">All Actions ({actionTypes.length})</option>
              {actionTypes.map((action) => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>

            <button
              onClick={fetchAuditLogs}
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

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Administrative Action</th>
                <th>Actor</th>
                <th>Target Entity</th>
                <th>Source IP</th>
                <th>Result</th>
                <th>Metadata</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                    Loading audit trail from MongoDB...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                    No administrative audit events recorded.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id}>
                    <td style={{ fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0369A1', fontSize: '12.5px' }}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={13} style={{ color: '#0284C7' }} />
                        <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '12.5px' }}>
                          {log.actorEmail}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-badge admin-badge-low">
                        {log.targetType || 'General'}{log.targetId ? ` (${String(log.targetId).slice(-6)})` : ''}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                      {log.ipAddress}
                    </td>
                    <td>
                      <span className={`admin-badge ${log.result === 'SUCCESS' ? 'admin-badge-active' : 'admin-badge-suspended'}`}>
                        {log.result === 'SUCCESS' ? (
                          <><CheckCircle2 size={11} /> SUCCESS</>
                        ) : (
                          <><XCircle size={11} /> FAILED</>
                        )}
                      </span>
                    </td>
                    <td style={{ fontSize: '11.5px', color: '#64748B', fontFamily: 'var(--font-mono)', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {JSON.stringify(log.metadata || {})}
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

export default AdminAuditLogs;
