import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import '../../styles/dashboard.css';

export const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleClose = () => {
    setMobileOpen(false);
  };

  return (
    <div className="soc-layout-root">
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          className="soc-sidebar-backdrop"
          onClick={handleClose}
          title="Close Navigation Drawer"
        />
      )}

      {/* Main Left Sidebar */}
      <Sidebar isMobileOpen={mobileOpen} onClose={handleClose} />

      <div className="soc-main-wrapper">
        {/* Top Navbar with Hamburger Toggle */}
        <Navbar onToggleNav={handleToggle} isMobileOpen={mobileOpen} />
        
        <main className="soc-content-area">
          <div className="soc-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;