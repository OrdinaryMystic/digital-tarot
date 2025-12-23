import React, { useRef, useState } from 'react';
import { CardInstance, Card } from '../types';
import styles from './Card.module.css';

interface CardProps {
  cardInstance: CardInstance;
  card: Card;
  onUpdate: (card: CardInstance) => void;
  onDragStart: (e: React.MouseEvent, card: CardInstance) => void;
  onRotateStart: (e: React.MouseEvent, card: CardInstance) => void;
  onDoubleClick: (card: CardInstance) => void;
  isDragging?: boolean;
  isRotating?: boolean;
}

export const CardComponent: React.FC<CardProps> = ({
  cardInstance,
  card,
  onUpdate,
  onDragStart,
  onRotateStart,
  onDoubleClick,
  isDragging = false,
  isRotating = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);

  const handleDoubleClick = () => {
    onDoubleClick(cardInstance);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Stop propagation to prevent table panning
    e.stopPropagation();
    // If clicking on rotate handle, it will handle its own event
    // Otherwise, start dragging
    onDragStart(e, cardInstance);
  };

  const handleRotateMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag from starting
    onRotateStart(e, cardInstance);
  };

  // Calculate total rotation: base rotation + 180 degrees if reversed
  const totalRotation = cardInstance.rotation + (cardInstance.isReversed ? 180 : 0);
  const transform = `translate(${cardInstance.position.x}px, ${cardInstance.position.y}px) rotate(${totalRotation}deg)`;
  const style: React.CSSProperties = {
    transform,
    zIndex: cardInstance.zIndex,
    position: 'absolute',
    cursor: isDragging ? 'grabbing' : isRotating ? 'grabbing' : 'grab',
    transformOrigin: 'center center',
  };

  return (
    <div
      ref={cardRef}
      data-card-id={cardInstance.id}
      className={`${styles.card} ${isDragging ? styles.dragging : ''} ${isRotating ? styles.rotating : ''}`}
      style={style}
      onMouseDown={handleMouseDown}
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
        {!isDragging && !isRotating && (
          <div 
            className={styles.rotateHandle}
            onMouseDown={handleRotateMouseDown}
          ></div>
        )}
      </div>
    </div>
  );
};

