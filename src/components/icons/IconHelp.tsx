import React from 'react';

interface IconHelpProps {
  className?: string;
}

export const IconHelp: React.FC<IconHelpProps> = ({ className }) => {
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
      <circle cx="10" cy="10" r="7" />
      <path d="M10 13v-1" />
      <path d="M10 8v.01" />
    </svg>
  );
};

