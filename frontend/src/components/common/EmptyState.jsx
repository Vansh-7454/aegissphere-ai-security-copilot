import React from 'react';
import { ShieldCheck } from 'lucide-react';
import './EmptyState.css';

export const EmptyState = ({
  title = 'No Data Available',
  description = 'There is currently no activity or data to display.',
  icon: Icon = ShieldCheck,
  action,
  className = '',
}) => {
  return (
    <div className={`aegis-empty-state ${className}`}>
      <div className="aegis-empty-icon">
        <Icon size={22} />
      </div>
      <h3 className="aegis-empty-title">{title}</h3>
      <p className="aegis-empty-desc">{description}</p>
      {action && <div className="aegis-empty-action">{action}</div>}
    </div>
  );
};

export default EmptyState;
