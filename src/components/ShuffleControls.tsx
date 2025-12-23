import React, { useState, useEffect, useRef } from 'react';
import { SeedGenerator } from '../utils/seedGenerator';
import './ShuffleControls.css';

interface ShuffleControlsProps {
  onShuffleOnce: () => void;
  isShuffling: boolean;
  onStartShuffling: () => void;
  onStopShuffling: () => void;
  seedGenerator: SeedGenerator;
}

const ShuffleControls: React.FC<ShuffleControlsProps> = ({
  onShuffleOnce,
  isShuffling,
  onStartShuffling,
  onStopShuffling,
  seedGenerator,
}) => {
  const [, setHoverTime] = useState(0);
  const hoverStartRef = useRef<number | null>(null);
  const hoverIntervalRef = useRef<number | null>(null);

  // Track hover time on shuffle button
  const handleMouseEnter = () => {
    hoverStartRef.current = Date.now();
    hoverIntervalRef.current = window.setInterval(() => {
      if (hoverStartRef.current) {
        const elapsed = Date.now() - hoverStartRef.current;
        setHoverTime(elapsed);
        seedGenerator.addHoverTime(16); // ~16ms per interval (60fps)
      }
    }, 16);
  };

  const handleMouseLeave = () => {
    if (hoverStartRef.current) {
      const totalHoverTime = Date.now() - hoverStartRef.current;
      seedGenerator.addHoverTime(totalHoverTime);
      hoverStartRef.current = null;
    }
    if (hoverIntervalRef.current) {
      clearInterval(hoverIntervalRef.current);
      hoverIntervalRef.current = null;
    }
    setHoverTime(0);
  };

  const handleShuffleOnce = () => {
    seedGenerator.trackClick();
    onShuffleOnce();
  };

  const handleToggleShuffling = () => {
    seedGenerator.trackClick();
    if (isShuffling) {
      onStopShuffling();
    } else {
      onStartShuffling();
    }
  };

  useEffect(() => {
    return () => {
      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="shuffle-controls">
      <button
        className="shuffle-button shuffle-once"
        onClick={handleShuffleOnce}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        Riffle Shuffle
      </button>
      <button
        className={`shuffle-button shuffle-continuous ${isShuffling ? 'active' : ''}`}
        onClick={handleToggleShuffling}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {isShuffling ? 'Stop Overhand' : 'Start Overhand'}
      </button>
    </div>
  );
};

export default ShuffleControls;

