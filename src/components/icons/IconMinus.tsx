import React from 'react';

interface IconMinusProps {
  className?: string;
}

export const IconMinus: React.FC<IconMinusProps> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
    >
      <path d="M5 10h10" />
    </svg>
  );
};

