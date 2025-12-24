import React from 'react';

interface IconEyeProps {
  className?: string;
}

export const IconEye: React.FC<IconEyeProps> = ({ className }) => {
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
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  );
};

