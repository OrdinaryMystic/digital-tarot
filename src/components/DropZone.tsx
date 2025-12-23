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

  // Convert table coordinates to screen coordinates
  const screenX = position.x * zoom + panOffset.x;
  const screenY = position.y * zoom + panOffset.y;
  const width = 140 * zoom;
  const height = 240 * zoom;

  return (
    <div
      ref={dropZoneRef}
      className="drop-zone"
      style={{
        left: `${screenX}px`,
        top: `${screenY}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <div className="drop-zone-border"></div>
    </div>
  );
};

export default DropZone;

