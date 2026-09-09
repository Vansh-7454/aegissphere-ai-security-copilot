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
import ProtectedRoute from '../components/common/ProtectedRoute';
import SecurityTestLab from "../pages/SecurityTestLab";

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

      {/* Protected Workspace Routes */}
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

      {/* Fallback Redirection to Landing Website */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
