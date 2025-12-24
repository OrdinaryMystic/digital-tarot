import React from 'react';

interface IconCutProps {
  className?: string;
}

export const IconCut: React.FC<IconCutProps> = ({ className }) => {
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
      <path d="M4 10h12" />
      <circle cx="4" cy="10" r="2" fill="currentColor" />
      <circle cx="16" cy="10" r="2" fill="currentColor" />
    </svg>
  );
};

