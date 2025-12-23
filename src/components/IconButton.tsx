import React, { useState } from 'react';
import './IconButton.css';

interface IconButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, tooltip, onClick, disabled = false, active = false }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="icon-button-wrapper">
      <button
        className={`icon-button ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={tooltip}
      >
        {icon}
      </button>
      {showTooltip && !disabled && (
        <div className="icon-tooltip">{tooltip}</div>
      )}
    </div>
  );
};

export default IconButton;

