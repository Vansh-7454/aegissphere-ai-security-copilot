import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, BarChart3, Database } from 'lucide-react';

export const AboutSection = () => {
  return (
    <section id="about" className="landing-section">
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="gradient-badge-lux">
          <span>About Aegisphere</span>
        </div>
        <h2 className="section-title">
          Eliminating SOC Alert Fatigue with <br />
          <span className="gradient-text-lux">Autonomous Agentic Intelligence</span>
        </h2>
        <p className="section-subtitle">
          Modern Security Operations Centers are overwhelmed by millions of raw logs and false positives. Aegisphere combines multi-agent AI orchestration with automated log forensics to deliver instantaneous defense.
        </p>
      </motion.div>

      <div className="features-grid">
        <motion.div
          className="feature-card-lux"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="feature-icon-box-lux">
            <Database size={26} />
          </div>
          <h3 className="feature-title-lux">Unified Log Ingestion</h3>
          <p className="feature-desc-lux">
            Ingest structured and unstructured security logs from syslogs, AWS CloudTrail, Nginx access logs, and custom web apps effortlessly.
          </p>
        </motion.div>

        <motion.div
          className="feature-card-lux"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="feature-icon-box-lux">
            <Cpu size={26} />
          </div>
          <h3 className="feature-title-lux">Multi-Agent Orchestration</h3>
          <p className="feature-desc-lux">
            Autonomous specialized AI subagents work in parallel to correlate indicators of compromise, parse complex payloads, and isolate zero-day vectors.
          </p>
        </motion.div>

        <motion.div
          className="feature-card-lux"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="feature-icon-box-lux">
            <BarChart3 size={26} />
          </div>
          <h3 className="feature-title-lux">Instant Mitigation Playbooks</h3>
          <p className="feature-desc-lux">
            Generate automated incident remediation scripts, IP containment policies, and executive compliance reports within seconds of detection.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
