import React from 'react';
import './Input.css';

export const Input = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  return (
    <div className={`aegis-input-container ${className}`}>
      {label && (
        <label htmlFor={id} className="aegis-input-label">
          {label}
        </label>
      )}
      <div className="aegis-input-wrapper">
        {leftIcon && <span className="aegis-input-icon-left">{leftIcon}</span>}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`aegis-input-field ${leftIcon ? 'aegis-input-has-left' : ''} ${
            rightIcon ? 'aegis-input-has-right' : ''
          }`}
          {...props}
        />
        {rightIcon && <span className="aegis-input-icon-right">{rightIcon}</span>}
      </div>
      {error && <span className="aegis-input-error-msg">{error}</span>}
    </div>
  );
};

export default Input;
