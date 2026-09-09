import React from 'react';
import './SectionTitle.css';

export const SectionTitle = ({
  title,
  subtitle,
  badge,
  actions,
  className = '',
  as: Tag = 'h2',
}) => {
  return (
    <div className={`aegis-section-title-container ${className}`}>
      <div className="aegis-section-title-content">
        <div className="aegis-section-title-heading-row">
          <Tag className="aegis-section-title-text">{title}</Tag>
          {badge && <div className="aegis-section-title-badge">{badge}</div>}
        </div>
        {subtitle && <p className="aegis-section-subtitle-text">{subtitle}</p>}
      </div>

      {actions && <div className="aegis-section-title-actions">{actions}</div>}
    </div>
  );
};

export default SectionTitle;
