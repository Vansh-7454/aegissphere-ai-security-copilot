import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Menu } from 'lucide-react';
import '../../styles/admin.css';

const AdminNavbar = ({ onToggleNav, isMobileOpen }) => {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'AD';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="admin-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={onToggleNav}
          className="admin-nav-toggle-btn"
          aria-label="Toggle admin navigation"
          aria-expanded={isMobileOpen}
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div className="soc-status-indicator" title="System Operational & Protected">
          <span className="soc-status-dot" />
          <span className="soc-status-label">Platform Active</span>
        </div>
        <span className="admin-mode-pill">
          ADMIN MODE
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="soc-user-pill">
          <div className="soc-user-avatar" style={{ background: 'linear-gradient(135deg, #DC2626 0%, #EA580C 100%)' }}>
            {getInitials(user?.name)}
          </div>
          <div className="soc-user-meta">
            <span className="soc-user-name">{user?.name || 'Administrator'}</span>
            <span className="soc-user-role" style={{ color: '#DC2626' }}>Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
