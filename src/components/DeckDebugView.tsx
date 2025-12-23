import React from 'react';
import { DeckCard } from '../types/deck';
import './DeckDebugView.css';

interface DeckDebugViewProps {
  deck: DeckCard[];
}

const DeckDebugView: React.FC<DeckDebugViewProps> = ({ deck }) => {
  return (
    <div className="deck-debug-view">
      <div className="deck-debug-header">Deck Order (Top to Bottom)</div>
      <div className="deck-debug-list">
        {deck.length === 0 ? (
          <div className="deck-debug-empty">Deck is empty</div>
        ) : (
          deck.map((deckCard, index) => (
            <div key={`${deckCard.card.id}-${index}`} className="deck-debug-item">
              <span className="deck-debug-index">{index + 1}.</span>
              <span className="deck-debug-name">{deckCard.card.name}</span>
              <span className={`deck-debug-arrow ${deckCard.isReversed ? 'reversed' : 'upright'}`}>
                {deckCard.isReversed ? '↓' : '↑'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DeckDebugView;

