import React from 'react';
import './DropZone.css';

interface DropZoneProps {
  position: { x: number; y: number };
  zoom: number;
  panOffset: { x: number; y: number };
  isVisible: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ position, zoom, panOffset, isVisible }) => {
  if (!isVisible) return null;

  // Convert table coordinates to screen coordinates
  const screenX = position.x * zoom + panOffset.x;
  const screenY = position.y * zoom + panOffset.y;
  const width = 140 * zoom;
  const height = 240 * zoom;

  return (
    <div
      className="drop-zone"
      style={{
        left: `${screenX}px`,
        top: `${screenY}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <div className="drop-zone-border">
        <div className="drop-zone-text">Drop to Return</div>
      </div>
    </div>
  );
};

export default DropZone;

