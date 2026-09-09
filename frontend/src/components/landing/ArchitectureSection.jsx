import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Database, Cpu, Globe, ShieldCheck } from 'lucide-react';

export const ArchitectureSection = () => {
  return (
    <section id="architecture" className="landing-section">
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="gradient-badge-lux">
          <span>Enterprise System Design</span>
        </div>
        <h2 className="section-title">
          Distributed Multi-Layer <br />
          <span className="gradient-text-lux">Platform Architecture</span>
        </h2>
        <p className="section-subtitle">
          Designed for high-throughput SOC operations with decoupled agent workers, asynchronous queueing, and secure API gateways.
        </p>
      </motion.div>

      <motion.div
        className="architecture-box-lux"
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Layers size={26} style={{ color: '#C084FC' }} />
          <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
            Aegisphere Core System Flow
          </h3>
        </div>
        <p style={{ fontSize: '15px', color: '#94A3B8', margin: 0 }}>
          High-performance decoupled architecture designed for enterprise scaling.
        </p>

        <div className="arch-layers-grid">
          <div className="arch-layer-card-lux">
            <Database size={32} style={{ color: '#60A5FA', marginBottom: 14 }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>1. Ingestion Layer</h4>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>Multer file stream parser, multi-format log ingestion, & REST API</p>
          </div>

          <div className="arch-layer-card-lux">
            <Cpu size={32} style={{ color: '#C084FC', marginBottom: 14 }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>2. Agentic Engine</h4>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>ThreatAgent pattern matcher & LLM forensic reasoning</p>
          </div>

          <div className="arch-layer-card-lux">
            <Globe size={32} style={{ color: '#38BDF8', marginBottom: 14 }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>3. Intel Knowledge Base</h4>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>CVE database, malicious IP feeds, & IOC telemetry</p>
          </div>

          <div className="arch-layer-card-lux">
            <ShieldCheck size={32} style={{ color: '#34D399', marginBottom: 14 }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>4. Enforcement Layer</h4>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>Automated containment playbooks & SOC dashboard alerts</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default ArchitectureSection;
