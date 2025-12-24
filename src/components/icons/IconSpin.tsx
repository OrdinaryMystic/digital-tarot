import React from 'react';

interface IconSpinProps {
  className?: string;
}

export const IconSpin: React.FC<IconSpinProps> = ({ className }) => {
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
      <path d="M10 3v4M10 13v4M3 10h4M13 10h4" />
      <path d="M5.636 5.636l2.828 2.828M11.536 11.536l2.828 2.828M5.636 14.364l2.828-2.828M11.536 8.464l2.828-2.828" />
      <circle cx="10" cy="10" r="6" />
    </svg>
  );
};

