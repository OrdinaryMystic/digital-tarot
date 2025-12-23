import React, { useEffect, useState } from 'react';
import './ShuffleNotification.css';

interface ShuffleNotificationProps {
  message: string;
  duration?: number;
  onComplete?: () => void;
}

export const ShuffleNotification: React.FC<ShuffleNotificationProps> = ({ 
  message, 
  duration = 1000,
  onComplete 
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 300); // Wait for fade out
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!visible) return null;

  return (
    <div className="shuffle-notification">
      <div className="shuffle-notification-content">
        {message}
      </div>
    </div>
  );
};

interface OverhandShuffleIndicatorProps {
  isActive: boolean;
}

export const OverhandShuffleIndicator: React.FC<OverhandShuffleIndicatorProps> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="overhand-shuffle-indicator">
      <div className="pulse-dot"></div>
      <span>Overhand Shuffling in Progress</span>
    </div>
  );
};

