import React from 'react';

interface IconShuffleProps {
  className?: string;
}

export const IconShuffle: React.FC<IconShuffleProps> = ({ className }) => {
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
      <path d="M4 6h3l3-3" />
      <path d="M4 10h3l3-3" />
      <path d="M16 4h-3l-3 3" />
      <path d="M16 16h-3l-3-3" />
      <path d="M12 4l4 4-4 4" />
      <path d="M8 8l-4 4 4 4" />
    </svg>
  );
};

