import React from 'react';
import './Skeleton.css';

export const Skeleton = ({
  variant = 'text', // 'text' | 'title' | 'circle' | 'card' | 'rect'
  width,
  height,
  className = '',
  style = {},
  count = 1,
}) => {
  const elements = Array.from({ length: count });

  const customStyle = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...style,
  };

  return (
    <>
      {elements.map((_, index) => (
        <div
          key={index}
          className={`aegis-skeleton aegis-skeleton-${variant} ${className}`}
          style={customStyle}
          aria-hidden="true"
        />
      ))}
    </>
  );
};

export default Skeleton;
