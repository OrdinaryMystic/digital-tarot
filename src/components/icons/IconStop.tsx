import React from 'react';

interface IconStopProps {
  className?: string;
}

export const IconStop: React.FC<IconStopProps> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <rect x="5" y="5" width="10" height="10" />
    </svg>
  );
};

