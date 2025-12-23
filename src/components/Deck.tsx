import React, { useState } from 'react';
import './Deck.css';

interface DeckProps {
  cardCount: number;
  onDraw: () => void;
  onCardDropped?: (cardInstanceId: string) => void;
  deckRef?: React.RefObject<HTMLDivElement>;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const Deck: React.FC<DeckProps> = ({ cardCount, onDraw, onCardDropped, deckRef, onMouseDown }) => {
  const [wasDragged, setWasDragged] = useState(false);
  const mouseDownPosRef = React.useRef<{ x: number; y: number } | null>(null);
  
  // Always show full deck visually (78 cards = ~10 layers)
  // Fixed height - always looks the same
  const VISIBLE_LAYERS = 10; // Always show 10 layers to represent full deck
  const deckHeight = 240; // Fixed height (same as card height)
  const deckWidth = 140; // Fixed width (same as card width)

  // Hide deck completely when empty
  if (cardCount === 0) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    // Only draw if we didn't drag (mouse didn't move much)
    if (!wasDragged) {
      onDraw();
    }
    setWasDragged(false);
    mouseDownPosRef.current = null;
  };

  const handleMouseDownInternal = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent table panning
    setWasDragged(false);
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
    if (onMouseDown) {
      onMouseDown(e);
    }
  };

  // Track if mouse moved during drag
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseDownPosRef.current) {
        const dx = Math.abs(e.clientX - mouseDownPosRef.current.x);
        const dy = Math.abs(e.clientY - mouseDownPosRef.current.y);
        // If mouse moved more than 5px, it was a drag
        if (dx > 5 || dy > 5) {
          setWasDragged(true);
        }
      }
    };

    const handleMouseUp = () => {
      mouseDownPosRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div 
      ref={deckRef}
      className="deck" 
      onClick={handleClick}
      onMouseDown={handleMouseDownInternal}
      style={{ width: `${deckWidth}px`, height: `${deckHeight}px` }}
    >
      <div className="deck-cards">
        {/* Always show full deck visually (10 layers representing 78 cards) */}
        {Array.from({ length: VISIBLE_LAYERS }).map((_, i) => (
          <div
            key={i}
            className="deck-card"
            style={{
              transform: `translate(${i * 1.5}px, ${i * 1.5}px)`,
              zIndex: i,
            }}
          >
            <img
              src="/cards/card_back.jpg"
              alt="Card Back"
              className="deck-card-image"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Deck;

