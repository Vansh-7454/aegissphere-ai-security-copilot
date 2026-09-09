import React from 'react';
import './Button.css';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'md',        // 'sm' | 'md' | 'lg'
  fullWidth = false,
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const classNames = [
    'aegis-btn',
    `aegis-btn-${variant}`,
    `aegis-btn-${size}`,
    fullWidth ? 'aegis-btn-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classNames}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="aegis-btn-spinner" aria-hidden="true" />
      ) : (
        leftIcon && <span className="aegis-btn-icon-left">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="aegis-btn-icon-right">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;
