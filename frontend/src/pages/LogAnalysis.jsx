import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/common/Layout';
import LogUploader from '../components/logs/LogUploader';
import LogHistoryTable from '../components/logs/LogHistoryTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FileText, AlertCircle } from 'lucide-react';
import '../styles/dashboard.css';

const LogAnalysis = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/logs');
      if (response.data && response.data.success) {
        setLogs(response.data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch log history:', err);
      setError('Unable to load uploaded log history from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDeleteLog = async (logId) => {
    if (!window.confirm('Are you sure you want to remove this log record?')) return;
    try {
      await api.delete(`/logs/${logId}`);
      setLogs((prev) => prev.filter((l) => l._id !== logId));
    } catch (err) {
      console.error('Failed to delete log file:', err);
      alert(err.response?.data?.message || 'Error deleting log file.');
    }
  };

  return (
    <Layout>
      <div className="soc-container">
        {/* Page Header */}
        <div className="soc-page-header">
          <div>
            <div className="soc-page-eyebrow">
              <FileText size={13} style={{ display: 'inline', marginRight: 4 }} />
              INGESTION GATEWAY
            </div>
            <h1 className="soc-page-title">Log Ingestion & Analysis</h1>
            <p className="soc-page-subtitle">
              Upload raw log files to extract telemetry events, evaluate signatures, and store structured audit trails.
            </p>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--status-critical-bg)',
              border: '1px solid var(--status-critical-border)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              color: '#F87171',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Upload Component */}
        <LogUploader onUploadSuccess={fetchLogs} />

        {/* Log History */}
        {loading ? (
          <LoadingSpinner message="Fetching log audit trail..." />
        ) : (
          <LogHistoryTable logs={logs} onDeleteLog={handleDeleteLog} loading={loading} />
        )}
      </div>
    </Layout>
  );
};

export default LogAnalysis;
