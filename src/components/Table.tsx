import React from 'react';
import { CardInstance, Card } from '../types';
import { CardComponent } from './Card';
import './Table.css';

interface TableProps {
  drawnCards: CardInstance[];
  getCardById: (cardId: string) => Card | undefined;
  onCardUpdate: (card: CardInstance) => void;
  onDragStart: (e: React.MouseEvent | React.TouchEvent, card: CardInstance) => void;
  onRotateStart?: (e: React.MouseEvent | React.TouchEvent, card: CardInstance) => void;
  onDoubleClick: (card: CardInstance) => void;
  onCardSelect?: (cardId: string) => void;
  selectedCardId?: string | null;
  isDragging?: boolean;
  zoom?: number;
  panOffset?: { x: number; y: number };
  onPanStart?: (e: React.MouseEvent | React.TouchEvent) => void;
  deckElement?: React.ReactNode;
  dropZones?: React.ReactNode;
}

const Table: React.FC<TableProps> = ({
  drawnCards,
  getCardById,
  onCardUpdate,
  onDragStart,
  onRotateStart,
  onDoubleClick,
  onCardSelect,
  selectedCardId,
  isDragging = false,
  zoom = 1,
  panOffset = { x: 0, y: 0 },
  onPanStart,
  deckElement,
  dropZones,
}) => {
  return (
    <div className="table">
      <div 
        className="table-surface"
        onMouseDown={onPanStart || undefined}
        onTouchStart={onPanStart || undefined}
        style={{
          transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoom})`,
          transformOrigin: 'top center',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {deckElement}
        {dropZones}
        {drawnCards.map(cardInstance => {
          const card = getCardById(cardInstance.cardId);
          if (!card) return null;

          return (
            <CardComponent
              key={cardInstance.id}
              cardInstance={cardInstance}
              card={card}
              onUpdate={onCardUpdate}
              onDragStart={onDragStart}
              onRotateStart={onRotateStart}
              onDoubleClick={onDoubleClick}
              onSelect={onCardSelect}
              isDragging={isDragging}
              isSelected={selectedCardId === cardInstance.id}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Table;

