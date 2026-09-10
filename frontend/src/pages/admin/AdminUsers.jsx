import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';
import {
  Users,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Eye,
  Shield,
  FileText,
  AlertTriangle,
  Calendar,
  Mail,
  UserCheck,
  UserX,
} from 'lucide-react';
import '../../styles/admin.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalData, setUserModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/users', {
        params: { search: search.trim() || undefined },
      });
      if (response.data?.success) {
        setUsers(response.data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.message || 'Failed to load user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleToggleStatus = async (user) => {
    const newStatus = (user.status || 'active').toLowerCase() === 'active' ? 'suspended' : 'active';
    const confirmMsg = `Are you sure you want to change status of '${user.email}' to ${newStatus.toUpperCase()}?`;
    if (!window.confirm(confirmMsg)) return;

    setStatusUpdating(user._id);
    setMessage(null);
    setError(null);

    try {
      const response = await api.patch(`/admin/users/${user._id}/status`, { status: newStatus });
      if (response.data?.success) {
        setMessage(`Account status for ${user.email} updated to ${newStatus}.`);
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(err.response?.data?.message || 'Failed to update user status.');
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleViewUser = async (userId) => {
    setModalLoading(true);
    setSelectedUser(userId);
    setUserModalData(null);
    try {
      const response = await api.get(`/admin/users/${userId}`);
      if (response.data?.success) {
        setUserModalData(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              <Users size={20} style={{ color: '#0284C7' }} />
              Platform Operator Directory
            </h2>
            <p className="admin-card-desc">
              Manage analyst & administrator identities, audit activity metrics, and control account activation status
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="soc-search-container" style={{ width: '260px' }}>
              <Search size={14} className="soc-search-icon" />
              <input
                type="text"
                className="soc-search-input"
                placeholder="Search by name, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="aegis-btn aegis-btn-secondary aegis-btn-sm"
            >
              <RefreshCw size={13} className={loading ? 'aegis-btn-spinner' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {message && (
          <div style={{ padding: '12px 16px', background: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)', color: '#15803D', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ padding: '12px 16px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: '#DC2626', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Operator</th>
                <th>Role</th>
                <th>Status</th>
                <th>Logs Ingested</th>
                <th>Threats Linked</th>
                <th>Incidents Assigned</th>
                <th>Reports Generated</th>
                <th>Registered</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                    Loading operator directory from MongoDB...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                    No matching users found in database.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, color: '#0F172A' }}>{u.name || 'Anonymous'}</span>
                        <span style={{ fontSize: '11.5px', color: '#64748B' }}>{u.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge ${u.role?.toLowerCase() === 'admin' ? 'admin-badge-critical' : 'admin-badge-low'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge ${(u.status || 'active').toLowerCase() === 'active' ? 'admin-badge-active' : 'admin-badge-suspended'}`}>
                        {(u.status || 'active').toLowerCase() === 'active' ? (
                          <><CheckCircle2 size={11} /> Active</>
                        ) : (
                          <><XCircle size={11} /> Suspended</>
                        )}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{u.logCount}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: u.threatCount > 0 ? '#DC2626' : '#64748B' }}>
                      {u.threatCount}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{u.incidentCount}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{u.reportCount}</td>
                    <td style={{ fontSize: '12px', color: '#64748B' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleViewUser(u._id)}
                          className="aegis-btn aegis-btn-secondary aegis-btn-sm"
                          title="Inspect user telemetry"
                        >
                          <Eye size={13} /> Inspect
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={statusUpdating === u._id}
                          className={`aegis-btn aegis-btn-sm ${
                            (u.status || 'active').toLowerCase() === 'active'
                              ? 'aegis-btn-danger'
                              : 'aegis-btn-primary'
                          }`}
                          style={{ minWidth: '84px', justifyContent: 'center' }}
                        >
                          {(u.status || 'active').toLowerCase() === 'active' ? (
                            <><UserX size={12} /> Suspend</>
                          ) : (
                            <><UserCheck size={12} /> Activate</>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Inspection Modal */}
      {selectedUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '28px 32px',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  <Users size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {userModalData?.user?.name || 'Operator Details'}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>{userModalData?.user?.email}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="aegis-btn aegis-btn-secondary aegis-btn-sm"
              >
                Close
              </button>
            </div>

            {modalLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading user telemetry...</div>
            ) : userModalData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div style={{ background: '#F8FCFE', border: '1px solid #BAE6FD', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>ROLE</span>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>{userModalData.user.role}</div>
                  </div>
                  <div style={{ background: '#F8FCFE', border: '1px solid #BAE6FD', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>STATUS</span>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: userModalData.user.status === 'suspended' ? '#DC2626' : '#15803D', marginTop: '2px' }}>
                      {userModalData.user.status?.toUpperCase() || 'ACTIVE'}
                    </div>
                  </div>
                  <div style={{ background: '#F8FCFE', border: '1px solid #BAE6FD', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>MEMBER SINCE</span>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                      {new Date(userModalData.user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Recent Uploaded Logs ({userModalData.logs?.length || 0})</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {userModalData.logs?.length > 0 ? (
                      userModalData.logs.map((l) => (
                        <div key={l._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-sm)', fontSize: '12.5px' }}>
                          <span style={{ fontWeight: 600, color: '#0F172A' }}>{l.originalName || l.filename}</span>
                          <span style={{ color: '#64748B' }}>{new Date(l.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>No logs uploaded by this user.</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Assigned Incidents ({userModalData.incidents?.length || 0})</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {userModalData.incidents?.length > 0 ? (
                      userModalData.incidents.map((i) => (
                        <div key={i._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-sm)', fontSize: '12.5px' }}>
                          <span style={{ fontWeight: 600, color: '#0F172A' }}>{i.incidentId}: {i.title}</span>
                          <span className={`admin-badge admin-badge-${i.severity?.toLowerCase() || 'medium'}`}>{i.status}</span>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>No incidents assigned to this user.</span>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
