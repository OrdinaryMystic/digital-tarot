import React from 'react';

interface IconResetProps {
  className?: string;
}

export const IconReset: React.FC<IconResetProps> = ({ className }) => {
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
      <path d="M3 10a7 7 0 0 1 14 0" />
      <path d="M10 3v4l-3-3" />
      <path d="M10 17v-4l3 3" />
      <circle cx="10" cy="10" r="7" />
    </svg>
  );
};

