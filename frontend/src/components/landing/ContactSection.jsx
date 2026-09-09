import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import '../../styles/landing.css';

const ContactSection = () => {
  return (
    <section id="contact" className="landing-section section-bg-slate">
      <motion.div
        className="contact-cta-banner"
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="contact-cta-title">Ready to Automate Your SOC Operations?</h2>
        <p className="contact-cta-subtext">
          Join security engineering teams using AegisSphere for autonomous multi-agent threat detection and rapid incident containment.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn-pill-primary" style={{ background: '#FFFFFF', color: '#6366F1', fontWeight: '800', padding: '13px 32px' }}>
            Get Started Now <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-pill-secondary" style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.25)', color: '#FFFFFF', padding: '13px 26px' }}>
            Console Sign In
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default ContactSection;
