import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  LayoutDashboard,
  ShieldAlert,
  FileText,
  Cpu,
  BrainCircuit,
  AlertTriangle,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import '../../styles/dashboard.css';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const operationsMenu = [
    {
      name: 'Command Center',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Log Ingestion',
      path: '/logs',
      icon: FileText,
    },
    {
      name: 'Threat Forensics',
      path: '/threats',
      icon: ShieldAlert,
    },
    {
      name: 'Security Test Lab',
      path: '/security-test',
      icon: ShieldCheck,
    },
  ];

  const intelligenceMenu = [
    {
      name: 'AI Agent Mesh',
      path: '/agents',
      icon: Cpu,
    },
    {
      name: 'Threat Intel Matrix',
      path: '/intel',
      icon: BrainCircuit,
    },
    {
      name: 'Incident Response',
      path: '/incidents',
      icon: AlertTriangle,
    },
    {
      name: 'SOC Reports',
      path: '/reports',
      icon: BarChart3,
    },
  ];

  const systemMenu = [
    {
      name: 'System Settings',
      path: '/settings',
      icon: Settings,
    },
  ];

  const getInitials = (name) => {
    if (!name) return 'OP';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <aside className="soc-sidebar">
      <div className="soc-sidebar-top">
        {/* Brand */}
        <div className="soc-brand">
          <div className="soc-brand-icon">
            <Shield size={18} />
          </div>
          <div className="soc-brand-text">
            <span className="soc-brand-title">AegisSphere</span>
            <span className="soc-brand-badge">SOC Console</span>
          </div>
        </div>

        {/* Section: Operations */}
        <div className="soc-nav-section-title">OPERATIONS</div>
        <nav className="soc-nav-group">
          {operationsMenu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `soc-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={16} className="soc-nav-icon" />
                <span className="soc-nav-label">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Section: Intelligence */}
        <div className="soc-nav-section-title">ANALYSIS & INTEL</div>
        <nav className="soc-nav-group">
          {intelligenceMenu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `soc-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={16} className="soc-nav-icon" />
                <span className="soc-nav-label">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Section: System */}
        <div className="soc-nav-section-title">SYSTEM & SETTINGS</div>
        <nav className="soc-nav-group">
          {systemMenu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `soc-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={16} className="soc-nav-icon" />
                <span className="soc-nav-label">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="soc-sidebar-footer">
        <div className="soc-footer-user">
          <div className="soc-footer-avatar">
            {getInitials(user?.name)}
          </div>
          <div className="soc-footer-meta">
            <span className="soc-footer-name">{user?.name || 'Operator'}</span>
            <span className="soc-footer-email">{user?.email || 'operator@sec.local'}</span>
          </div>
          <button
            onClick={logout}
            className="soc-logout-btn"
            title="Sign out of session"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;