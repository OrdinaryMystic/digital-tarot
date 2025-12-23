import React from 'react';
import { CardInstance } from '../types';
import styles from './RotationHandle.module.css';

interface RotationHandleProps {
  cardInstance: CardInstance;
  onRotateStart: (e: React.MouseEvent | React.TouchEvent) => void;
}

export const RotationHandle: React.FC<RotationHandleProps> = ({
  cardInstance,
  onRotateStart,
}) => {
  // Card dimensions
  const CARD_WIDTH = 140;
  const CARD_HEIGHT = 240;
  const HANDLE_OFFSET = 30; // Distance below/above card center
  
  // Handle position relative to card top-left: below if not reversed, above if reversed
  // Position it at the center horizontally, and offset vertically
  const handleY = cardInstance.isReversed ? -HANDLE_OFFSET : CARD_HEIGHT + HANDLE_OFFSET;
  
  return (
    <div
      className={styles.rotationHandle}
      style={{
        left: `${CARD_WIDTH / 2}px`,
        top: `${handleY}px`,
        transform: 'translate(-50%, -50%)',
      }}
      onMouseDown={onRotateStart}
      onTouchStart={onRotateStart}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="10" cy="10" r="8" fill="rgba(102, 126, 234, 0.9)" stroke="rgba(118, 75, 162, 1)" strokeWidth="2" />
        <path
          d="M6 10 L10 6 M14 10 L10 6 M6 10 L10 14 M14 10 L10 14"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

