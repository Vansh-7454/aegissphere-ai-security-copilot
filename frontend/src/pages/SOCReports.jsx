import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { downloadReportPdf } from '../services/api';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { Download, FileCheck, AlertTriangle } from 'lucide-react';
import '../styles/dashboard.css';

const SOCReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setErrorMessage('');
        const res = await api.get('/reports');
        if (res.data?.reports) {
          setReports(res.data.reports);
        } else {
          setReports([]);
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
        // Fallback to dashboard reports route if available
        try {
          const dashRes = await api.get('/dashboard/reports');
          if (dashRes.data?.reports) {
            setReports(dashRes.data.reports);
          } else {
            setReports([]);
          }
        } catch (dashErr) {
          setErrorMessage(err.response?.data?.message || 'Failed to load reports from server.');
          setReports([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleDownloadReport = async (report) => {
    if (!report?._id) return;
    try {
      setDownloadingId(report._id);
      setErrorMessage('');

      // Request authentic PDF binary blob from backend API
      const blobData = await downloadReportPdf(report._id);
      
      const blob = new Blob([blobData], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      const sanitizedTitle = (report.title || 'soc_audit_report')
        .replace(/[^a-zA-Z0-9-_]/g, '_')
        .toLowerCase();
      link.download = `aegissphere-${sanitizedTitle}-${report._id}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('PDF Download Error:', err);
      setErrorMessage(
        err.response?.data?.message ||
          'Failed to generate and download the PDF report. Please verify your permissions.'
      );
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Layout>
      <div className="soc-container">
        {/* Page Header */}
        <div className="soc-page-header">
          <div>
            <div className="soc-page-eyebrow">
              <FileCheck size={13} style={{ display: 'inline', marginRight: 4 }} />
              AUDIT TRAIL & REPORTS
            </div>
            <h1 className="soc-page-title">Security Reports & Compliance</h1>
            <p className="soc-page-subtitle">
              Authoritative SOC audit reports, incident summaries, and compliance archives generated directly from MongoDB telemetry.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                background: '#E0F2FE',
                color: '#0284C7',
                border: '1px solid #BAE6FD',
                padding: '4px 14px',
                borderRadius: '9999px',
                fontSize: '11.5px',
                fontWeight: 700,
              }}
            >
              Total Reports: {reports.length}
            </span>
          </div>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div
            style={{
              padding: '12px 16px',
              marginBottom: '16px',
              borderRadius: '10px',
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertTriangle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Loading / Empty / Content */}
        {loading ? (
          <LoadingSpinner message="Loading compliance and audit reports from MongoDB..." />
        ) : reports.length === 0 ? (
          <EmptyState
            title="No Reports Available"
            description="Reports will appear here automatically when security log files are uploaded and analyzed by the SOC pipeline."
            actionLabel="Upload Security Log"
            onAction={() => navigate('/logs')}
          />
        ) : (
          /* Reports Grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
            {reports.map((report) => {
              const isDownloading = downloadingId === report._id;
              return (
                <div key={report._id} className="soc-stat-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#0284C7', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                      SOC AUDIT REPORT
                    </span>
                    <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                      {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
                    {report.title}
                  </h3>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.55', margin: '0 0 16px 0' }}>
                    {report.summary || 'Authoritative security audit log and threat classification summary.'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '14px', borderTop: '1px solid rgba(186, 230, 253, 0.65)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                        {report.threatCount || 0} Correlated Threat{report.threatCount === 1 ? '' : 's'}
                      </span>
                      {report.criticalCount > 0 && (
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            color: '#DC2626',
                            background: '#FEE2E2',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            border: '1px solid #FECACA',
                          }}
                        >
                          {report.criticalCount} Critical
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDownloadReport(report)}
                      disabled={isDownloading}
                      className="aegis-btn aegis-btn-primary aegis-btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Download size={13} />
                      {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SOCReports;
