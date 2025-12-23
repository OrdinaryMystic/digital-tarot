import React, { useRef, useState } from 'react';
import { CardInstance, Card } from '../types';
import { RotationHandle } from './RotationHandle';
import styles from './Card.module.css';

interface CardProps {
  cardInstance: CardInstance;
  card: Card;
  onUpdate: (card: CardInstance) => void;
  onDragStart: (e: React.MouseEvent | React.TouchEvent, card: CardInstance) => void;
  onDoubleClick: (card: CardInstance) => void;
  onRotateStart?: (e: React.MouseEvent | React.TouchEvent, card: CardInstance) => void;
  onSelect?: (cardId: string) => void;
  isDragging?: boolean;
  isSelected?: boolean;
}

export const CardComponent: React.FC<CardProps> = ({
  cardInstance,
  card,
  onDragStart,
  onDoubleClick,
  onRotateStart,
  onSelect,
  isDragging = false,
  isSelected = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);
  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const wasDraggedRef = useRef(false);

  const handleDoubleClick = () => {
    onDoubleClick(cardInstance);
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    // Stop propagation to prevent table panning
    e.stopPropagation();
    
    // Track initial mouse position to detect if it was a drag
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    mouseDownPosRef.current = { x: clientX, y: clientY };
    wasDraggedRef.current = false;
    
    onDragStart(e, cardInstance);
  };

  const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    // Only select if it was a click (not a drag)
    if (!wasDraggedRef.current && onSelect) {
      onSelect(cardInstance.id);
    }
    mouseDownPosRef.current = null;
    wasDraggedRef.current = false;
  };

  // Track mouse movement to detect drags
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (mouseDownPosRef.current) {
        const clientX = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientY : (e as MouseEvent).clientY;
        const dx = Math.abs(clientX - mouseDownPosRef.current.x);
        const dy = Math.abs(clientY - mouseDownPosRef.current.y);
        // If mouse moved more than 5px, it was a drag
        if (dx > 5 || dy > 5) {
          wasDraggedRef.current = true;
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleMouseMove);
    };
  }, []);

  // Calculate total rotation: base rotation + 180 degrees if reversed
  const totalRotation = cardInstance.rotation + (cardInstance.isReversed ? 180 : 0);
  const transform = `translate(${cardInstance.position.x}px, ${cardInstance.position.y}px) rotate(${totalRotation}deg)`;
  const style: React.CSSProperties = {
    transform,
    zIndex: cardInstance.zIndex,
    position: 'absolute',
    cursor: isDragging ? 'grabbing' : 'grab',
    transformOrigin: 'center center',
  };

  return (
    <div
      ref={cardRef}
      data-card-id={cardInstance.id}
      className={`${styles.card} ${isDragging ? styles.dragging : ''} ${isSelected ? styles.selected : ''}`}
      style={style}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    >
      <div className={styles.cardInner}>
        {cardInstance.isFlipped ? (
          <div className={styles.cardFace}>
            {!imageError ? (
              <img
                src={card.imagePath}
                alt={card.name}
                className={styles.cardImage}
                loading="lazy"
                onError={() => {
                  setImageError(true);
                }}
              />
            ) : (
              <div className={styles.cardPlaceholder}>
                <div className={styles.cardPlaceholderText}>{card.name}</div>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.cardBack}>
            <img
              src="/cards/card_back.jpg"
              alt="Card Back"
              className={styles.cardBackImage}
              onError={(e) => {
                // Fallback to pattern if image doesn't exist
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const patternDiv = document.createElement('div');
                patternDiv.className = styles.cardBackPattern;
                target.parentElement?.appendChild(patternDiv);
              }}
            />
          </div>
        )}
        {isSelected && onRotateStart && (
          <RotationHandle
            cardInstance={cardInstance}
            onRotateStart={(e) => onRotateStart(e, cardInstance)}
          />
        )}
      </div>
    </div>
  );
};

