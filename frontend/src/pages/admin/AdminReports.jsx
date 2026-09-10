import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';
import {
  FileText,
  Download,
  RefreshCw,
  User,
  Calendar,
  ShieldCheck,
  Search,
} from 'lucide-react';
import '../../styles/admin.css';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/reports');
      if (response.data?.success) {
        setReports(response.data.reports || []);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError(err.response?.data?.message || 'Failed to load platform reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownloadPdf = async (reportId, reportTitle) => {
    setDownloading(reportId);
    try {
      const response = await api.get(`/reports/${reportId}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(reportTitle || 'SOC_Report').replace(/[^a-z0-9]/gi, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download PDF report from server.');
    } finally {
      setDownloading(null);
    }
  };

  const filteredReports = reports.filter((r) =>
    (r.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.generatedBy?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.generatedBy?.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              <FileText size={20} style={{ color: '#0284C7' }} />
              Platform-Wide Security Reports & PDF Archive
            </h2>
            <p className="admin-card-desc">
              Inspect and export generated SOC investigation summaries and multi-agent compliance reports
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="soc-search-container" style={{ width: '260px' }}>
              <Search size={14} className="soc-search-icon" />
              <input
                type="text"
                className="soc-search-input"
                placeholder="Search report title, author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              onClick={fetchReports}
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
                <th>Report Title & Summary</th>
                <th>Author</th>
                <th>Associated Log</th>
                <th>Threat Count</th>
                <th>Status</th>
                <th>Generated Date</th>
                <th style={{ textAlign: 'right' }}>Download</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                    Loading reports from MongoDB...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                    No security reports available.
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, color: '#0F172A' }}>{r.title}</span>
                        <span style={{ fontSize: '11.5px', color: '#64748B', maxWidth: '340px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.summary || 'Standard security assessment generated by multi-agent mesh.'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={13} style={{ color: '#0284C7' }} />
                        <span style={{ fontWeight: 600, color: '#0F172A' }}>
                          {r.generatedBy?.name || r.generatedBy?.email || 'System'}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748B' }}>
                      {r.logId?.originalName || r.logId?.filename || 'Telemetry Stream'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      <span style={{ color: r.criticalCount > 0 ? '#DC2626' : '#0284C7' }}>
                        {r.threatCount || 0} ({r.criticalCount || 0} Critical)
                      </span>
                    </td>
                    <td>
                      <span className="admin-badge admin-badge-active">
                        {r.status || 'Generated'}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748B' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDownloadPdf(r._id, r.title)}
                        disabled={downloading === r._id}
                        className="aegis-btn aegis-btn-secondary aegis-btn-sm"
                      >
                        <Download size={13} className={downloading === r._id ? 'aegis-btn-spinner' : ''} />
                        {downloading === r._id ? 'Exporting...' : 'PDF'}
                      </button>
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

export default AdminReports;
