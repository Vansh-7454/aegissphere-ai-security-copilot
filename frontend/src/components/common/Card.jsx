import React from 'react';
import './Card.css';

export const Card = ({
  children,
  padding = 'md', // 'sm' | 'md' | 'lg'
  interactive = false,
  className = '',
  onClick,
  ...props
}) => {
  const classNames = [
    'aegis-card',
    `aegis-card-pad-${padding}`,
    interactive ? 'aegis-card-interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export default Card;
