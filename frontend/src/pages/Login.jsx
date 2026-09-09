import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import '../styles/auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [localError, setLocalError] = useState(null);

  const { login, error, loading, setError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setError(null);

    if (!email || !password) {
      setLocalError('Please provide both email and password.');
      return;
    }

    try {
      await login(email, password, rememberMe);
      navigate('/dashboard');
    } catch (err) {
      // Handled by AuthContext
    }
  };

  const displayError = localError || error;

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Symmetrical Showcase Box (Pastel Blue) */}
        <div className="auth-showcase-box">
          <div>
            <Link to="/" className="auth-brand-link" title="Click to return to Home Page">
              <div className="auth-brand-icon">
                <Shield size={18} />
              </div>
              <span>AegisSphere Platform</span>
              <span className="auth-back-badge">
                <ArrowLeft size={11} /> Home
              </span>
            </Link>
          </div>

          <div className="auth-showcase-hero">
            <h1 className="auth-showcase-title">
              Security Log Analysis & Threat Detection
            </h1>
            <p className="auth-showcase-desc">
              A centralized dashboard to upload server logs, detect suspicious patterns, and review threat forensics.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature-row">
                <CheckCircle2 size={16} style={{ color: '#15803D', flexShrink: 0 }} />
                <span>Multi-format security log ingestion (.log, .txt, .csv, .json)</span>
              </div>
              <div className="auth-feature-row">
                <CheckCircle2 size={16} style={{ color: '#15803D', flexShrink: 0 }} />
                <span>Rule-based detection for SQLi, brute force, and port scans</span>
              </div>
              <div className="auth-feature-row">
                <CheckCircle2 size={16} style={{ color: '#15803D', flexShrink: 0 }} />
                <span>MITRE ATT&CK framework mapping & forensics</span>
              </div>
            </div>
          </div>

          <div className="auth-showcase-footer">
            AegisSphere · College Final-Year Project
          </div>
        </div>

        {/* Right Symmetrical Sign In Form Box (Clean White) */}
        <div className="auth-form-box">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Operator Sign In</h2>
            <p className="auth-form-subtitle">
              Enter your credentials to access the SOC workspace
            </p>
          </div>

          {displayError && (
            <div className="auth-alert-error" style={{ marginBottom: '16px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              id="login-email"
              type="email"
              label="Operator Email"
              placeholder="operator@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              leftIcon={<Mail size={16} />}
              autoComplete="email"
              required
            />

            <div style={{ position: 'relative' }}>
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                leftIcon={<Lock size={16} />}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '32px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                Remember session
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Password reset requested. Please contact your SOC administrator.');
                }}
                style={{ color: '#2563EB', fontWeight: 600 }}
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={loading}
              style={{ marginTop: '6px' }}
            >
              Sign In to Console
            </Button>
          </form>

          <div className="auth-footer-text">
            Need credentials?
            <Link to="/register" className="auth-footer-link">
              Register account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
