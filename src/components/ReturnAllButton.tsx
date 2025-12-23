import React from 'react';
import './ReturnAllButton.css';

interface ReturnAllButtonProps {
  onReturnAll: () => void;
  disabled?: boolean;
}

const ReturnAllButton: React.FC<ReturnAllButtonProps> = ({ onReturnAll, disabled = false }) => {
  return (
    <button
      className="return-all-button"
      onClick={onReturnAll}
      disabled={disabled}
    >
      Return All Cards
    </button>
  );
};

export default ReturnAllButton;

