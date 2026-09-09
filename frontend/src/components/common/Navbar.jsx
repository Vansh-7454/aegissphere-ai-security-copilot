import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, Clock, User, Shield } from 'lucide-react';
import '../../styles/dashboard.css';

const Navbar = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' UTC'
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'OP';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="soc-navbar">
      <div className="soc-navbar-left">
        <div className="soc-status-indicator" title="Threat Detection Engine Status">
          <span className="soc-status-dot"></span>
          <span className="soc-status-label">System Active</span>
        </div>

        <div className="soc-utc-clock">
          <Clock size={13} />
          <span>{currentTime || '00:00:00 UTC'}</span>
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
