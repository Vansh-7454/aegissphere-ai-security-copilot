import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Menu, Shield } from 'lucide-react';
import '../../styles/dashboard.css';

const Navbar = ({ onToggleNav, isMobileOpen }) => {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'OP';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="soc-navbar">
      <div className="soc-navbar-left">
        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={onToggleNav}
          className="soc-nav-toggle-btn"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileOpen}
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div className="soc-status-indicator" title="Threat Detection Engine Status">
          <span className="soc-status-dot" />
          <span className="soc-status-label">System Active</span>
        </div>
      </div>

      <div className="soc-navbar-right">
        <div className="soc-search-container">
          <Search size={14} className="soc-search-icon" />
          <input
            type="text"
            className="soc-search-input"
            placeholder="Search by log, IP, date or ID..."
          />
          <kbd className="soc-search-kbd">Ctrl K</kbd>
        </div>

        <div className="soc-user-pill">
          <div className="soc-user-avatar">
            {getInitials(user?.name)}
          </div>
          <div className="soc-user-meta">
            <span className="soc-user-name">{user?.name || 'User'}</span>
            <span className="soc-user-role">{user?.role || 'Analyst'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
