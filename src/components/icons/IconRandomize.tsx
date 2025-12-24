import React from 'react';

interface IconRandomizeProps {
  className?: string;
}

export const IconRandomize: React.FC<IconRandomizeProps> = ({ className }) => {
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
      <path d="M3 8h3l2-2" />
      <path d="M3 12h3l2 2" />
      <path d="M17 8h-3l-2-2" />
      <path d="M17 12h-3l-2 2" />
      <path d="M8 3v3l-2 2" />
      <path d="M12 3v3l2 2" />
      <path d="M8 17v-3l-2-2" />
      <path d="M12 17v-3l2-2" />
    </svg>
  );
};

