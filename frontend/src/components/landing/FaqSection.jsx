import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import '../../styles/landing.css';

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'What is AegisSphere?',
      a: 'AegisSphere is a final-year college project designed to provide an accessible, AI-assisted security dashboard for log parsing, rule-based threat detection, forensic investigation, and basic incident remediation recommendations.',
    },
    {
      q: 'What technology stack is used in this project?',
      a: 'The frontend is built with React, Vite, Lucide icons, and modern CSS. The backend runs on Node.js and Express with MongoDB for data persistence and JWT authentication with role-based access control (Admin / Analyst).',
    },
    {
      q: 'How does threat detection work in AegisSphere?',
      a: 'Threat detection is currently powered by a rule-based heuristic engine (ThreatAgent.js) that analyzes log patterns for known attack behaviors such as brute-force authentication bursts, SQL injection signatures, cross-site scripting (XSS), and port scanning.',
    },
    {
      q: 'What log formats are supported?',
      a: 'AegisSphere supports standard web server access logs (Apache/Nginx), Linux SSH authentication logs (auth.log), CSV security exports, and structured JSON logs.',
    },
    {
      q: 'What is the role of AI agents in the system?',
      a: 'The platform is structured into modular agent roles (Parser, Classifier, Threat Intel, Remediation). While the current implementation uses rule-based heuristics, the architecture is designed to accommodate LLM-based reasoning and automated orchestration.',
    },
    {
      q: 'What is the purpose of the Security Test Lab?',
      a: 'The Test Lab allows evaluators and students to safely simulate attack traffic (such as SQL injection or brute force) to demonstrate and verify how the detection algorithms respond in real time.',
    },
  ];

  return (
    <section id="faq" className="landing-section">
      <div className="landing-section-header">
        <span className="landing-eyebrow" style={{ margin: '0 auto' }}>
          FAQ
        </span>
        <h2 className="landing-section-title">
          Frequently Asked Questions
        </h2>
        <p className="landing-section-subtitle">
          Answers to common questions about the project, architecture, detection logic, and tech stack.
        </p>
      </div>

      <div className="landing-faq-container">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="landing-faq-item">
              <button
                className="landing-faq-question"
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                aria-expanded={isOpen}
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <ChevronUp size={16} style={{ color: 'var(--accent-primary)' }} />
                ) : (
                  <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                )}
              </button>
              {isOpen && (
                <div className="landing-faq-answer">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FaqSection;
