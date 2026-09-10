import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const ProtectedRoute = ({ children, requireAuth = true, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <LoadingSpinner message="Authenticating session..." />
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && user) {
    return <Navigate to={user.role?.toLowerCase() === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  // Strict Client-Side Role Check (in addition to server-side 403 enforcement)
  if (requireAdmin && user && user.role?.toLowerCase() !== 'admin') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        padding: '24px',
        fontFamily: 'var(--font-sans)'
      }}>
        <div style={{
          maxWidth: '480px',
          background: '#FFFFFF',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px 32px',
          boxShadow: '0 12px 32px rgba(239, 68, 68, 0.08)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#FEE2E2',
            color: '#DC2626',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <ShieldAlert size={26} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            403 — Administrative Access Denied
          </h2>
          <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.6', marginBottom: '24px' }}>
            Your account ({user.email}) has the <strong>{user.role}</strong> role. The requested route requires elevated <strong>Admin</strong> privileges.
          </p>
          <Link to="/dashboard" className="aegis-btn aegis-btn-primary aegis-btn-md" style={{ width: '100%', justifyContent: 'center' }}>
            <ArrowLeft size={15} /> Return to Analyst Console
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
