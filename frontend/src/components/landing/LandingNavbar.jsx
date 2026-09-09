import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import '../../styles/landing.css';

const LandingNavbar = () => {
  return (
    <header className="landing-header">
      <div className="landing-nav-container">
        {/* Brand */}
        <Link to="/" className="landing-brand">
          <div className="landing-brand-icon">
            <Shield size={18} />
          </div>
          <span>AegisSphere</span>
        </Link>

        {/* Navigation Links */}
        <nav>
          <ul className="landing-nav-menu">
            <li><a href="#features" className="landing-nav-link">Features</a></li>
            <li><a href="#agents" className="landing-nav-link">AI Agents</a></li>
            <li><a href="#workflow" className="landing-nav-link">Workflow</a></li>
            <li><a href="#testlab" className="landing-nav-link">Test Lab</a></li>
            <li><a href="#faq" className="landing-nav-link">FAQ</a></li>
          </ul>
        </nav>

        {/* Auth CTAs */}
        <div className="landing-nav-actions">
          <Link to="/login" className="aegis-btn aegis-btn-ghost aegis-btn-sm" style={{ fontWeight: 600 }}>
            Sign in
          </Link>
          <Link to="/login" className="aegis-btn aegis-btn-primary aegis-btn-sm">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
};

export default LandingNavbar;
