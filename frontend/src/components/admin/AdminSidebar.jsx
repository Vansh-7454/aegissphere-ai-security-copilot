import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  Shield,
  AlertTriangle,
  FileText,
  Cpu,
  History,
  Activity,
  LogOut,
  ArrowLeftRight,
  X,
} from 'lucide-react';
import '../../styles/admin.css';

const AdminSidebar = ({ isMobileOpen, onClose }) => {
  const { user, logout } = useAuth();

  const adminMenuItems = [
    {
      name: 'Overview',
      path: '/admin',
      icon: LayoutDashboard,
      end: true,
    },
    {
      name: 'User Management',
      path: '/admin/users',
      icon: Users,
    },
    {
      name: 'Threat Analytics',
      path: '/admin/threats',
      icon: Shield,
    },
    {
      name: 'Incident Overview',
      path: '/admin/incidents',
      icon: AlertTriangle,
    },
    {
      name: 'Security Reports',
      path: '/admin/reports',
      icon: FileText,
    },
    {
      name: 'Agent Monitoring',
      path: '/admin/agents',
      icon: Cpu,
    },
    {
      name: 'Audit Logs',
      path: '/admin/audit-logs',
      icon: History,
    },
    {
      name: 'System Health',
      path: '/admin/health',
      icon: Activity,
    },
  ];

  const getInitials = (name) => {
    if (!name) return 'AD';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside className={`admin-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="admin-sidebar-top">
        {/* Brand & Mobile Close Button */}
        <div className="admin-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="admin-brand-icon">
              <ShieldAlert size={20} />
            </div>
            <div className="admin-brand-text">
              <span className="admin-brand-title">AegisSphere</span>
              <span className="admin-brand-badge">ADMIN CONSOLE</span>
            </div>
          </div>

          {/* Close button on mobile drawer */}
          <button
            onClick={onClose}
            className="admin-sidebar-close-btn"
            title="Close admin navigation"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Switch to Analyst View */}
        <Link
          to="/dashboard"
          className="admin-switch-btn"
          title="Switch to Analyst Workspace"
          onClick={handleLinkClick}
        >
          <ArrowLeftRight size={14} />
          <span>Analyst Workspace</span>
        </Link>

        {/* Navigation Menu */}
        <div className="admin-nav-section-title" style={{ marginTop: '16px' }}>
          ADMINISTRATION
        </div>
        <nav className="admin-nav-group">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `admin-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={16} className="admin-nav-icon" />
                <span className="admin-nav-label">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="admin-sidebar-footer">
        <div className="admin-footer-user">
          <div className="admin-footer-avatar">
            {getInitials(user?.name)}
          </div>
          <div className="admin-footer-meta">
            <span className="admin-footer-name">{user?.name || 'Administrator'}</span>
            <span className="admin-footer-role">ADMINISTRATOR</span>
          </div>
          <button
            onClick={logout}
            className="soc-logout-btn"
            title="Sign out of administrative session"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
