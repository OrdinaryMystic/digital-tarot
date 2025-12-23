import React from 'react';
import './MobileWarning.css';

interface MobileWarningProps {
  onDismiss?: () => void;
}

export const MobileWarning: React.FC<MobileWarningProps> = ({ onDismiss }) => {
  return (
    <div className="mobile-warning">
      <div className="mobile-warning-content">
        <p>
          <strong>This app is not yet optimized for mobile!</strong> For the best experience, please visit{' '}
          <strong>digitaltarot.app</strong> from your desktop.
        </p>
        {onDismiss && (
          <button className="mobile-warning-close" onClick={onDismiss} aria-label="Dismiss">
            ×
          </button>
        )}
      </div>
    </div>
  );
};

