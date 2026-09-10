import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';
import {
  AlertTriangle,
  Search,
  RefreshCw,
  Clock,
  User,
  ShieldAlert,
  FileText,
  Activity,
} from 'lucide-react';
import '../../styles/admin.css';

const AdminIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/incidents', {
        params: {
          status: statusFilter,
          severity: severityFilter,
          search: search.trim() || undefined,
        },
      });
      if (response.data?.success) {
        setIncidents(response.data.incidents || []);
        setSummary(response.data.summary || null);
      }
    } catch (err) {
      console.error('Failed to load platform incidents:', err);
      setError(err.response?.data?.message || 'Failed to load incident records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [statusFilter, severityFilter, search]);

  return (
    <AdminLayout>
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              <AlertTriangle size={20} style={{ color: '#EA580C' }} />
              Platform-Wide Incident Management & Lifecycle
            </h2>
            <p className="admin-card-desc">
              Track multi-analyst triage workflows, containment states, and resolution histories
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="soc-search-container" style={{ width: '220px' }}>
              <Search size={14} className="soc-search-icon" />
              <input
                type="text"
                className="soc-search-input"
                placeholder="Search incident ID, title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="aegis-select"
              style={{ padding: '8px 12px', borderRadius: 'var(--radius-pill)', border: '1px solid #BAE6FD', fontSize: '12.5px', background: '#FFFFFF' }}
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Investigating">Investigating</option>
              <option value="In Progress">In Progress</option>
              <option value="Contained">Contained</option>
              <option value="Mitigated">Mitigated</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

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
              onClick={fetchIncidents}
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
                <th>Incident ID & Title</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Assigned Analyst</th>
                <th>Source Log</th>
                <th>Action History</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                    Loading platform incidents from database...
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                    No incident records matching criteria.
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc._id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0284C7', fontSize: '12px' }}>
                          {inc.incidentId}
                        </span>
                        <span style={{ fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                          {inc.title}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge admin-badge-${(inc.severity || 'medium').toLowerCase()}`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge ${inc.status === 'Closed' || inc.status === 'Resolved' || inc.status === 'Mitigated' ? 'admin-badge-active' : 'admin-badge-high'}`}>
                        {inc.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={13} style={{ color: '#0284C7' }} />
                        <span style={{ fontWeight: 600, color: '#0F172A' }}>
                          {inc.assignedTo?.name || inc.assignedTo?.email || 'Unassigned'}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748B' }}>
                      {inc.logId?.originalName || inc.logId?.filename || 'N/A'}
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0369A1' }}>
                        {inc.actionHistory?.length || 0} event(s)
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748B' }}>
                      {new Date(inc.createdAt).toLocaleDateString()}
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

export default AdminIncidents;
