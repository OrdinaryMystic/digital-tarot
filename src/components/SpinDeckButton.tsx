import React from 'react';
import './SpinDeckButton.css';

interface SpinDeckButtonProps {
  onSpin: () => void;
  disabled?: boolean;
}

const SpinDeckButton: React.FC<SpinDeckButtonProps> = ({ onSpin, disabled = false }) => {
  return (
    <button
      className="spin-deck-button"
      onClick={onSpin}
      disabled={disabled}
    >
      Spin Deck
    </button>
  );
};

export default SpinDeckButton;

