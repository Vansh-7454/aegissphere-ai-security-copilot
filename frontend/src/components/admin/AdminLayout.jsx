import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import '../../styles/admin.css';

const AdminLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleClose = () => {
    setMobileOpen(false);
  };

  return (
    <div className="admin-layout-root">
      {/* Admin Mobile Overlay Backdrop */}
      {mobileOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={handleClose}
          title="Close Admin Navigation Drawer"
        />
      )}

      {/* Admin Left Sidebar */}
      <AdminSidebar isMobileOpen={mobileOpen} onClose={handleClose} />

      <div className="admin-main-wrapper">
        {/* Admin Top Navbar with Hamburger */}
        <AdminNavbar onToggleNav={handleToggle} isMobileOpen={mobileOpen} />
        
        <main className="admin-content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
