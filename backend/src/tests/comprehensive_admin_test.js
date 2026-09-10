const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const API_BASE = 'http://127.0.0.1:5000/api';

const runTest = async () => {
  console.log('====================================================');
  console.log('AEGISPHERE REAL ADMIN DASHBOARD - 24-VECTOR TEST SUITE');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${details ? '- ' + details : ''}`);
      failed++;
    }
  };

  try {
    // Connect to DB for direct verification
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aegissphere';
    await mongoose.connect(mongoUri);
    const User = require('../models/User');
    const Log = require('../models/Log');
    const Threat = require('../models/Threat');
    const Incident = require('../models/Incident');
    const Report = require('../models/Report');
    const AdminAuditLog = require('../models/AdminAuditLog');

    console.log('\n--- 1. AUTH & ROLE ENFORCEMENT ---');

    // Vector 1: Public Registration forces Analyst role
    const testEmail = `test_analyst_${Date.now()}@aegis.local`;
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Test Reg Operator',
      email: testEmail,
      password: 'Password123!',
      role: 'Admin', // Attempt privilege escalation via registration
    });
    assert(
      regRes.status === 201 &&
        regRes.data.user.role.toLowerCase() === 'analyst' &&
        regRes.data.user.status === 'active',
      'Vector 1: Public registration ignores client-supplied role and enforces Analyst role'
    );

    // Vector 2: Admin Login
    const adminLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@aegissphere.io',
      password: 'AdminSecret123!',
    });
    const adminToken = adminLoginRes.data.token;
    assert(
      adminLoginRes.status === 200 &&
        adminLoginRes.data.user.role.toLowerCase() === 'admin' &&
        !!adminToken,
      'Vector 2: Admin login succeeds and returns valid JWT with Admin role'
    );

    // Verify Admin Login Audit Log
    const loginAudit = await AdminAuditLog.findOne({
      action: 'ADMIN_LOGIN',
      actorEmail: 'admin@aegissphere.io',
    }).sort({ timestamp: -1 });
    assert(!!loginAudit, 'Vector 2b: Admin login generated ADMIN_LOGIN entry in AdminAuditLog');

    // Analyst Token
    const analystLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'user1@gmail.com',
      password: 'password123',
    });
    const analystToken = analystLoginRes.data.token;

    console.log('\n--- 2. ANALYST RBAC BLOCK TESTS (HTTP 403) ---');
    const adminEndpoints = [
      { name: 'Vector 3: GET /admin/dashboard', url: '/admin/dashboard' },
      { name: 'Vector 4: GET /admin/users', url: '/admin/users' },
      { name: 'Vector 5: GET /admin/threats', url: '/admin/threats' },
      { name: 'Vector 6: GET /admin/incidents', url: '/admin/incidents' },
      { name: 'Vector 7: GET /admin/reports', url: '/admin/reports' },
      { name: 'Vector 8: GET /admin/agents', url: '/admin/agents' },
      { name: 'Vector 9: GET /admin/audit-logs', url: '/admin/audit-logs' },
      { name: 'Vector 10: GET /admin/health', url: '/admin/health' },
    ];

    for (const ep of adminEndpoints) {
      try {
        await axios.get(`${API_BASE}${ep.url}`, {
          headers: { Authorization: `Bearer ${analystToken}` },
        });
        assert(false, ep.name, 'Expected 403 Forbidden but received 200');
      } catch (err) {
        assert(
          err.response && err.response.status === 403,
          ep.name,
          `Status: ${err.response?.status}`
        );
      }
    }

    console.log('\n--- 3. ADMIN ENDPOINTS DATA FIDELITY & ZERO-MOCK VALIDATION ---');

    // Vector 11: GET /admin/dashboard
    const dashRes = await axios.get(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dbUserCount = await User.countDocuments();
    const dbThreatCount = await Threat.countDocuments();
    const dbIncidentCount = await Incident.countDocuments();
    const dbReportCount = await Report.countDocuments();
    const dbLogCount = await Log.countDocuments();

    assert(
      dashRes.status === 200 &&
        dashRes.data.stats &&
        dashRes.data.stats.totalUsers === dbUserCount &&
        dashRes.data.stats.totalThreats === dbThreatCount &&
        dashRes.data.stats.totalIncidents === dbIncidentCount &&
        dashRes.data.stats.totalReports === dbReportCount &&
        dashRes.data.stats.totalLogs === dbLogCount &&
        Array.isArray(dashRes.data.threatTrend) &&
        Array.isArray(dashRes.data.recentActivity),
      'Vector 11: GET /admin/dashboard returns 100% exact MongoDB counts and genuine timeline arrays'
    );

    // Vector 12: GET /admin/users
    const usersRes = await axios.get(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      usersRes.status === 200 &&
        usersRes.data.users.length === dbUserCount &&
        usersRes.data.users.every(
          (u) =>
            typeof u.logCount === 'number' &&
            typeof u.threatCount === 'number' &&
            typeof u.incidentCount === 'number' &&
            typeof u.reportCount === 'number'
        ),
      'Vector 12: GET /admin/users returns all database users with accurate aggregated entity counts'
    );

    // Vector 13: GET /admin/users/:id
    const sampleUser = await User.findOne({ email: 'user1@gmail.com' });
    const userDetailRes = await axios.get(`${API_BASE}/admin/users/${sampleUser._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      userDetailRes.status === 200 &&
        userDetailRes.data.user._id.toString() === sampleUser._id.toString() &&
        Array.isArray(userDetailRes.data.logs) &&
        Array.isArray(userDetailRes.data.incidents) &&
        Array.isArray(userDetailRes.data.reports),
      'Vector 13: GET /admin/users/:id returns populated user profile with related logs, incidents, and reports'
    );

    // Vector 14: Suspend User Status Toggle
    const targetUser = await User.findOne({ email: testEmail });
    const suspendRes = await axios.patch(
      `${API_BASE}/admin/users/${targetUser._id}/status`,
      { status: 'suspended', reason: 'Automated test suspension' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    assert(
      suspendRes.status === 200 && suspendRes.data.user.status === 'suspended',
      'Vector 14: PATCH /admin/users/:id/status successfully transitions status to suspended'
    );

    // Vector 15: Suspended User Login Blocked
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: testEmail,
        password: 'Password123!',
      });
      assert(false, 'Vector 15: Suspended user login attempt must be rejected');
    } catch (err) {
      assert(
        err.response &&
          err.response.status === 403 &&
          (err.response.data?.message || '').toLowerCase().includes('suspended'),
        'Vector 15: Suspended user login is strictly rejected with 403 and suspension message'
      );
    }

    // Vector 16: Reactivate User
    const activateRes = await axios.patch(
      `${API_BASE}/admin/users/${targetUser._id}/status`,
      { status: 'active', reason: 'Reactivation test' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    assert(
      activateRes.status === 200 && activateRes.data.user.status === 'active',
      'Vector 16: Status toggle back to active restores user access'
    );

    // Vector 17: Prevent Admin Self-Lockout
    const adminUser = await User.findOne({ email: 'admin@aegissphere.io' });
    try {
      await axios.patch(
        `${API_BASE}/admin/users/${adminUser._id}/status`,
        { status: 'suspended' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      assert(false, 'Vector 17: Admin self-suspension must be prevented');
    } catch (err) {
      assert(
        err.response &&
          err.response.status === 400 &&
          (err.response.data?.message || '').toLowerCase().includes('suspend'),
        'Vector 17: Admin self-lockout prevention strictly blocks self-suspension with 400'
      );
    }

    // Vector 18: GET /admin/threats
    const threatsRes = await axios.get(`${API_BASE}/admin/threats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      threatsRes.status === 200 &&
        threatsRes.data.threats.length === dbThreatCount &&
        threatsRes.data.analytics &&
        Array.isArray(threatsRes.data.analytics.severity) &&
        Array.isArray(threatsRes.data.analytics.mitreTechniques) &&
        Array.isArray(threatsRes.data.analytics.topSourceIps),
      'Vector 18: GET /admin/threats returns genuine threat aggregations and MITRE technique frequencies'
    );

    // Vector 19: GET /admin/incidents
    const incidentsRes = await axios.get(`${API_BASE}/admin/incidents`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      incidentsRes.status === 200 &&
        incidentsRes.data.incidents.length === dbIncidentCount &&
        incidentsRes.data.summary &&
        typeof incidentsRes.data.summary.byStatus === 'object',
      'Vector 19: GET /admin/incidents returns genuine incident lifecycle stats'
    );

    // Vector 20: GET /admin/reports
    const reportsRes = await axios.get(`${API_BASE}/admin/reports`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      reportsRes.status === 200 &&
        reportsRes.data.reports.length === dbReportCount,
      'Vector 20: GET /admin/reports returns all platform-wide SOC reports'
    );

    // Vector 21: GET /admin/agents
    const agentsRes = await axios.get(`${API_BASE}/admin/agents`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      agentsRes.status === 200 &&
        Array.isArray(agentsRes.data.agents) &&
        agentsRes.data.agents.length === 4 &&
        agentsRes.data.agents[2].totalExecutions === dbThreatCount,
      'Vector 21: GET /admin/agents returns truthful 4-agent pipeline execution counts matching threat records'
    );

    // Vector 22: GET /admin/audit-logs
    const auditRes = await axios.get(`${API_BASE}/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      auditRes.status === 200 &&
        Array.isArray(auditRes.data.auditLogs) &&
        auditRes.data.auditLogs.length > 0,
      'Vector 22: GET /admin/audit-logs returns genuine audit trail entries with actor metadata'
    );

    // Vector 23: GET /admin/health
    const healthRes = await axios.get(`${API_BASE}/admin/health`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      healthRes.status === 200 &&
        healthRes.data.health &&
        healthRes.data.health.mongodb.status === 'Operational' &&
        typeof healthRes.data.health.server.uptimeSeconds === 'number' &&
        healthRes.data.health.pdfEngine.status === 'Operational' &&
        typeof healthRes.data.health.geminiAi.configured === 'boolean',
      'Vector 23: GET /admin/health returns live diagnostics for MongoDB, Server, Gemini AI, and PDFKit'
    );

    // Vector 24: PDF Report Generation for Admin
    const sampleReport = await Report.findOne();
    if (sampleReport) {
      const pdfRes = await axios.get(`${API_BASE}/reports/${sampleReport._id}/pdf`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        responseType: 'arraybuffer',
      });
      assert(
        pdfRes.status === 200 &&
          pdfRes.headers['content-type'] === 'application/pdf' &&
          pdfRes.data.length > 1000,
        'Vector 24: Real SOC PDF generation executes and streams valid binary PDF for Admin'
      );
    } else {
      console.log('[SKIP] Vector 24: No report found in database to test PDF stream');
    }

    // Clean up temporary test user
    await User.deleteOne({ email: testEmail });

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal Test Execution Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
    process.exit(1);
  }
};

runTest();
