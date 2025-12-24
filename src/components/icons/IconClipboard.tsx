import React from 'react';

interface IconClipboardProps {
  className?: string;
}

export const IconClipboard: React.FC<IconClipboardProps> = ({ className }) => {
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
      <path d="M7 4h6v2H7V4z" />
      <rect x="5" y="6" width="10" height="12" rx="1" />
    </svg>
  );
};

