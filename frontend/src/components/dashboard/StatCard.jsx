import React from 'react';
import '../../styles/dashboard.css';

export const StatCard = ({
  label,
  value,
  icon: Icon,
  subtext,
  variant = 'default', // 'default' | 'critical' | 'high' | 'success'
  className = '',
}) => {
  return (
    <div className={`soc-stat-card ${className}`}>
      <div className="soc-stat-top">
        <span className="soc-stat-label">{label}</span>
        {Icon && (
          <div className={`soc-stat-icon ${variant !== 'default' ? variant : ''}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="soc-stat-bottom">
        <span className="soc-stat-value">{value ?? 0}</span>
        {subtext && (
          <span className={`soc-stat-trend ${variant === 'critical' ? 'negative' : variant === 'high' ? 'warning' : 'positive'}`}>
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
