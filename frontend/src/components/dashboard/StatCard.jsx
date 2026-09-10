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
  const getIconBg = () => {
    if (variant === 'critical') return { bg: '#FEE2E2', border: '#FECACA', color: '#DC2626' };
    if (variant === 'high') return { bg: '#FFEDD5', border: '#FED7AA', color: '#EA580C' };
    if (variant === 'success') return { bg: '#DCFCE7', border: '#BBF7D0', color: '#15803D' };
    return { bg: '#E0F2FE', border: '#BAE6FD', color: '#0284C7' };
  };

  const iconStyle = getIconBg();

  return (
    <div
      className={`soc-stat-card ${className}`}
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(186, 230, 253, 0.75)',
        borderRadius: '16px',
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '6px',
        boxShadow: '0 2px 8px rgba(2, 132, 199, 0.04)',
        minHeight: '130px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Inter, sans-serif' }}>
          {label}
        </span>
        {Icon && (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: iconStyle.bg,
              border: `1px solid ${iconStyle.border}`,
              color: iconStyle.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={18} />
          </div>
        )}
      </div>

      <div style={{ margin: '4px 0 2px 0' }}>
        <span
          style={{
            fontSize: '32px',
            fontWeight: 800,
            color: '#0F172A',
            fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            display: 'block',
          }}
        >
          {value ?? 0}
        </span>
      </div>

      {subtext && (
        <div style={{ marginTop: '2px' }}>
          <span
            style={{
              fontSize: '12.5px',
              fontWeight: 500,
              color: '#64748B',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.4,
              display: 'block',
            }}
          >
            {subtext}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
