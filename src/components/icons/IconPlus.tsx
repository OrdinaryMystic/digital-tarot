import React from 'react';

interface IconPlusProps {
  className?: string;
}

export const IconPlus: React.FC<IconPlusProps> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
    >
      <path d="M10 5v10M5 10h10" />
    </svg>
  );
};

