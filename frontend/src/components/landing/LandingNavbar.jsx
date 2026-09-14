import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Menu, X, ArrowRight } from 'lucide-react';
import '../../styles/landing.css';

const LandingNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on ESC or window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 860) setMobileMenuOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="landing-header">
      <div className="landing-nav-container">
        {/* Brand */}
        <Link to="/" className="landing-brand" onClick={closeMenu}>
          <div className="landing-brand-icon">
            <Shield size={18} />
          </div>
          <span>AegisSphere</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="landing-nav-desktop">
          <ul className="landing-nav-menu">
            <li><a href="#features" className="landing-nav-link">Features</a></li>
            <li><a href="#agents" className="landing-nav-link">AI Agents</a></li>
            <li><a href="#workflow" className="landing-nav-link">Workflow</a></li>
            <li><a href="#testlab" className="landing-nav-link">Test Lab</a></li>
            <li><a href="#faq" className="landing-nav-link">FAQ</a></li>
          </ul>
        </nav>

        {/* Desktop Auth CTAs */}
        <div className="landing-nav-actions">
          <Link to="/login" className="aegis-btn aegis-btn-ghost aegis-btn-sm" style={{ fontWeight: 600 }}>
            Sign in
          </Link>
          <Link to="/login" className="aegis-btn aegis-btn-primary aegis-btn-sm">
            Get Started
          </Link>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className="landing-mobile-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="landing-mobile-backdrop" onClick={closeMenu} />
      )}

      {/* Mobile Drawer Menu */}
      <div className={`landing-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="landing-mobile-drawer-inner">
          <nav className="landing-mobile-nav">
            <a href="#features" className="landing-mobile-link" onClick={closeMenu}>
              Features
            </a>
            <a href="#agents" className="landing-mobile-link" onClick={closeMenu}>
              AI Agents
            </a>
            <a href="#workflow" className="landing-mobile-link" onClick={closeMenu}>
              Workflow
            </a>
            <a href="#testlab" className="landing-mobile-link" onClick={closeMenu}>
              Test Lab
            </a>
            <a href="#faq" className="landing-mobile-link" onClick={closeMenu}>
              FAQ
            </a>
          </nav>

          <div className="landing-mobile-actions">
            <Link to="/login" className="aegis-btn aegis-btn-ghost w-full" onClick={closeMenu}>
              Sign in
            </Link>
            <Link to="/login" className="aegis-btn aegis-btn-primary w-full" onClick={closeMenu}>
              Get Started <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingNavbar;
