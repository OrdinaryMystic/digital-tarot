import React from 'react';

interface IconMenuProps {
  className?: string;
}

export const IconMenu: React.FC<IconMenuProps> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={className}
    >
      <path d="M3 5h14M3 10h14M3 15h14" />
    </svg>
  );
};

