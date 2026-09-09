import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import '../styles/auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const { register, error, loading, setError } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '#64748B' };
    let score = 0;
    if (pass.length >= 6) score += 35;
    if (pass.length >= 10) score += 25;
    if (/[0-9]/.test(pass)) score += 20;
    if (/[^A-Za-z0-9]/.test(pass)) score += 20;

    if (score < 40) return { score: 30, label: 'Weak', color: '#DC2626' };
    if (score < 75) return { score: 65, label: 'Medium', color: '#EA580C' };
    return { score: 100, label: 'Strong', color: '#15803D' };
  };

  const passStrength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setError(null);
    setSuccessMsg(null);

    if (!name || !email || !password || !confirmPassword) {
      setLocalError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    try {
      await register(name, email, password);
      setSuccessMsg('Account registered successfully. Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
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
              Register Operator Account
            </h1>
            <p className="auth-showcase-desc">
              Access the AegisSphere security dashboard to analyze logs, view detected threats, and test detection rules.
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
                <span>Controlled Security Test Lab for safe simulation</span>
              </div>
            </div>
          </div>

          <div className="auth-showcase-footer">
            AegisSphere · College Final-Year Project
          </div>
        </div>

        {/* Right Symmetrical Register Form Box (Clean White) */}
        <div className="auth-form-box">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Create Credentials</h2>
            <p className="auth-form-subtitle">
              Register a new SOC operator or analyst account
            </p>
          </div>

          {displayError && (
            <div className="auth-alert-error" style={{ marginBottom: '16px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{displayError}</span>
            </div>
          )}

          {successMsg && (
            <div className="auth-alert-success" style={{ marginBottom: '16px' }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              id="reg-name"
              type="text"
              label="Full Name"
              placeholder="Operator Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading || Boolean(successMsg)}
              leftIcon={<User size={16} />}
              required
            />

            <Input
              id="reg-email"
              type="email"
              label="Email Address"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || Boolean(successMsg)}
              leftIcon={<Mail size={16} />}
              autoComplete="email"
              required
            />

            <div style={{ position: 'relative' }}>
              <Input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || Boolean(successMsg)}
                leftIcon={<Lock size={16} />}
                autoComplete="new-password"
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

            {password && (
              <div className="auth-pass-strength">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Password Strength</span>
                  <span style={{ color: passStrength.color, fontWeight: 600 }}>{passStrength.label}</span>
                </div>
                <div className="auth-pass-bar">
                  <div
                    className="auth-pass-fill"
                    style={{ width: `${passStrength.score}%`, background: passStrength.color }}
                  />
                </div>
              </div>
            )}

            <Input
              id="reg-confirm-password"
              type={showPassword ? 'text' : 'password'}
              label="Confirm Password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading || Boolean(successMsg)}
              leftIcon={<Lock size={16} />}
              autoComplete="new-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={loading}
              disabled={Boolean(successMsg)}
              style={{ marginTop: '6px' }}
            >
              Register Operator Account
            </Button>
          </form>

          <div className="auth-footer-text">
            Already have an account?
            <Link to="/login" className="auth-footer-link">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
