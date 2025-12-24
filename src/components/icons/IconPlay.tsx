import React from 'react';

interface IconPlayProps {
  className?: string;
}

export const IconPlay: React.FC<IconPlayProps> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M6 4l10 6-10 6V4z" />
    </svg>
  );
};

