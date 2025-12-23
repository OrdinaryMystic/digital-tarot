import React from 'react';
import './SplitDeckButton.css';

interface SplitDeckButtonProps {
  onSplit: () => void;
  disabled?: boolean;
}

const SplitDeckButton: React.FC<SplitDeckButtonProps> = ({ onSplit, disabled = false }) => {
  return (
    <button
      className="split-deck-button"
      onClick={onSplit}
      disabled={disabled}
    >
      Split Deck
    </button>
  );
};

export default SplitDeckButton;

