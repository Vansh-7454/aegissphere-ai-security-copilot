import React from 'react';
import './LoadingSpinner.css';

export const LoadingSpinner = ({
  message = 'Loading data...',
  className = '',
}) => {
  return (
    <div className={`aegis-spinner-container ${className}`} role="status">
      <div className="aegis-spinner-ring" />
      {message && <span className="aegis-spinner-message">{message}</span>}
    </div>
  );
};

export default LoadingSpinner;
