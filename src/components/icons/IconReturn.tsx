import React from 'react';

interface IconReturnProps {
  className?: string;
}

export const IconReturn: React.FC<IconReturnProps> = ({ className }) => {
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
      <path d="M4 10h10M4 10l4-4M4 10l4 4" />
      <path d="M16 6v8" />
    </svg>
  );
};

