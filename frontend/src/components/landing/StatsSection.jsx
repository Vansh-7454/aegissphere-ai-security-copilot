import React from 'react';
import { motion } from 'framer-motion';

export const StatsSection = () => {
  return (
    <section className="landing-section">
      <motion.div
        className="stats-banner-lux"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div>
          <div className="stat-val-lux">&lt; 2s</div>
          <div className="stat-lbl-lux">Threat Isolation Speed</div>
        </div>

        <div>
          <div className="stat-val-lux">5</div>
          <div className="stat-lbl-lux">Autonomous AI Subagents</div>
        </div>

        <div>
          <div className="stat-val-lux">100%</div>
          <div className="stat-lbl-lux">Automated Log Parser Coverage</div>
        </div>

        <div>
          <div className="stat-val-lux">4</div>
          <div className="stat-lbl-lux">Threat Categories Handled</div>
        </div>
      </motion.div>
    </section>
  );
};

export default StatsSection;
