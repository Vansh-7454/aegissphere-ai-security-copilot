import React from 'react';
import { Code, Server, Database, Shield, Zap, Layers, Cpu } from 'lucide-react';

const TECH_ITEMS = [
  { name: 'React 19', category: 'Frontend Framework', icon: Code },
  { name: 'Node.js & Express 5', category: 'Backend Server', icon: Server },
  { name: 'MongoDB & Mongoose', category: 'Database', icon: Database },
  { name: 'JWT & Bcrypt', category: 'Security Auth', icon: Shield },
  { name: 'Vite 8', category: 'Build Tooling', icon: Zap },
  { name: 'Recharts', category: 'Data Visualization', icon: Layers },
  { name: 'Multer', category: 'Log File Streamer', icon: Cpu },
  { name: 'Axios API Interceptor', category: 'HTTP Client', icon: Server },
];

export const TechStackSection = () => {
  return (
    <section id="tech" className="landing-section">
      <div className="section-header">
        <div className="gradient-badge">
          <span>Production Tech Stack</span>
        </div>
        <h2 className="section-title">
          Powered by Industry-Standard <br />
          <span className="gradient-text">Full-Stack MERN Architecture</span>
        </h2>
        <p className="section-subtitle">
          Built with high-efficiency JavaScript technologies to ensure sub-millisecond API response times and reliable scalability.
        </p>
      </div>

      <div className="tech-stack-container">
        {TECH_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="tech-badge">
              <Icon size={18} style={{ color: '#2563EB' }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{item.name}</div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 400 }}>{item.category}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TechStackSection;
