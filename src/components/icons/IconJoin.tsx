import React from 'react';

interface IconJoinProps {
  className?: string;
}

export const IconJoin: React.FC<IconJoinProps> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8 4h4" />
      <path d="M8 16h4" />
      <path d="M4 8v4" />
      <path d="M16 8v4" />
      <circle cx="10" cy="6" r="1.5" fill="currentColor" />
      <circle cx="10" cy="14" r="1.5" fill="currentColor" />
      <circle cx="6" cy="10" r="1.5" fill="currentColor" />
      <circle cx="14" cy="10" r="1.5" fill="currentColor" />
    </svg>
  );
};

