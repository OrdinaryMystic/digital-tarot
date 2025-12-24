import React from 'react';

interface IconEyeClosedProps {
  className?: string;
}

export const IconEyeClosed: React.FC<IconEyeClosedProps> = ({ className }) => {
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
      <path d="M10 4C6 4 3 6.5 1 10c2 3.5 5 6 9 6s7-2.5 9-6c-2-3.5-5-6-9-6z" />
      <path d="M6 6l8 8M14 6l-8 8" />
    </svg>
  );
};

