import React from 'react';
import './Badge.css';

export const Badge = ({
  children,
  variant = 'default', // 'default' | 'critical' | 'high' | 'medium' | 'low' | 'success'
  size = 'md',        // 'sm' | 'md'
  dot = false,
  className = '',
  ...props
}) => {
  const classNames = [
    'aegis-badge',
    `aegis-badge-${variant}`,
    `aegis-badge-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classNames} {...props}>
      {dot && <span className="aegis-badge-dot" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
