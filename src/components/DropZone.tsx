import React, { useRef, useEffect } from 'react';
import './DropZone.css';

interface DropZoneProps {
  isVisible: boolean;
  position: { x: number; y: number };
  zoom: number;
  panOffset: { x: number; y: number };
  onBoundsUpdate?: (bounds: { left: number; right: number; top: number; bottom: number }) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ isVisible, position, zoom, panOffset, onBoundsUpdate }) => {
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && dropZoneRef.current && onBoundsUpdate) {
      const updateBounds = () => {
        // Use requestAnimationFrame to ensure DOM has updated
        requestAnimationFrame(() => {
          const rect = dropZoneRef.current?.getBoundingClientRect();
          if (rect) {
            onBoundsUpdate({
              left: rect.left,
              right: rect.right,
              top: rect.top,
              bottom: rect.bottom,
            });
          }
        });
      };
      updateBounds();
      window.addEventListener('resize', updateBounds);
      return () => window.removeEventListener('resize', updateBounds);
    }
  }, [isVisible, onBoundsUpdate, position, zoom, panOffset]);

  if (!isVisible) return null;

  // The drop zone is positioned inside table-surface, so it inherits the transform
  // We just need to position it at the deck location (no additional transform needed)
  const width = 140;
  const height = 240;

  return (
    <div
      ref={dropZoneRef}
      className="drop-zone"
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${width}px`,
        height: `${height}px`,
        pointerEvents: 'none', // Don't block interactions
      }}
    >
      <div className="drop-zone-text">drop card to return to deck</div>
      <div className="drop-zone-border"></div>
    </div>
  );
};

export default DropZone;

