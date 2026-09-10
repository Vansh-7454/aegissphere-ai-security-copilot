import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import LogAnalysis from '../pages/LogAnalysis';
import ThreatForensics from '../pages/ThreatForensics';
import AgentCoordinator from '../pages/AgentCoordinator';
import ThreatIntelMatrix from '../pages/ThreatIntelMatrix';
import IncidentResponse from '../pages/IncidentResponse';
import SOCReports from '../pages/SOCReports';
import SystemSettings from '../pages/SystemSettings';
import SecurityTestLab from '../pages/SecurityTestLab';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Admin Console Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminThreats from '../pages/admin/AdminThreats';
import AdminIncidents from '../pages/admin/AdminIncidents';
import AdminReports from '../pages/admin/AdminReports';
import AdminAgents from '../pages/admin/AdminAgents';
import AdminAuditLogs from '../pages/admin/AdminAuditLogs';
import AdminSystemHealth from '../pages/admin/AdminSystemHealth';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Startup Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Guest Authentication Routes */}
      <Route
        path="/login"
        element={
          <ProtectedRoute requireAuth={false}>
            <Login />
          </ProtectedRoute>
        }
      />
      <Route
        path="/register"
        element={
          <ProtectedRoute requireAuth={false}>
            <Register />
          </ProtectedRoute>
        }
      />

      {/* Protected Analyst Workspace Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireAuth={true}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/logs"
        element={
          <ProtectedRoute requireAuth={true}>
            <LogAnalysis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/threats"
        element={
          <ProtectedRoute requireAuth={true}>
            <ThreatForensics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agents"
        element={
          <ProtectedRoute requireAuth={true}>
            <AgentCoordinator />
          </ProtectedRoute>
        }
      />
      <Route
        path="/intel"
        element={
          <ProtectedRoute requireAuth={true}>
            <ThreatIntelMatrix />
          </ProtectedRoute>
        }
      />
      <Route
        path="/incidents"
        element={
          <ProtectedRoute requireAuth={true}>
            <IncidentResponse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute requireAuth={true}>
            <SOCReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute requireAuth={true}>
            <SystemSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/security-test"
        element={
          <ProtectedRoute requireAuth={true}>
            <SecurityTestLab />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Console Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAuth={true} requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requireAuth={true} requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requireAuth={true} requireAdmin={true}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/threats"
        element={
          <ProtectedRoute requireAuth={true} requireAdmin={true}>
            <AdminThreats />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/incidents"
        element={
          <ProtectedRoute requireAuth={true} requireAdmin={true}>
            <AdminIncidents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute requireAuth={true} requireAdmin={true}>
            <AdminReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/agents"
        element={
          <ProtectedRoute requireAuth={true} requireAdmin={true}>
            <AdminAgents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute requireAuth={true} requireAdmin={true}>
            <AdminAuditLogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/health"
        element={
          <ProtectedRoute requireAuth={true} requireAdmin={true}>
            <AdminSystemHealth />
          </ProtectedRoute>
        }
      />

      {/* Fallback Redirection to Landing Website */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
