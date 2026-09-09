import React from 'react';
import './StatusChip.css';

export const StatusChip = ({
  status = 'Active', // 'Active' | 'Investigating' | 'Mitigated' | 'Resolved' | 'Monitoring' | 'Idle'
  label,
  className = '',
  ...props
}) => {
  const normStatus = (status || '').toLowerCase();
  const displayLabel = label || status || 'Active';

  return (
    <span
      className={`aegis-status-chip aegis-status-${normStatus} ${className}`}
      {...props}
    >
      <span className="aegis-status-chip-dot" aria-hidden="true" />
      <span>{displayLabel}</span>
    </span>
  );
};

export default StatusChip;
