import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import '../../styles/dashboard.css';

export const Layout = ({ children }) => {
  return (
    <div className="soc-layout-root">
      <Sidebar />
      <div className="soc-main-wrapper">
        <Navbar />
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