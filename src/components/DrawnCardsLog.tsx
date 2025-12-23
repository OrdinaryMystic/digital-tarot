import React from 'react';
import { CardInstance } from '../types';
import { Card } from '../types';
import './DrawnCardsLog.css';

interface DrawnCardsLogProps {
  drawnCards: CardInstance[];
  getCardById: (cardId: string) => Card | undefined;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

const DrawnCardsLog: React.FC<DrawnCardsLogProps> = ({ drawnCards, getCardById, isMinimized, onToggleMinimize }) => {
  // Calculate statistics
  const stats = React.useMemo(() => {
    let majorArcana = 0;
    const suits = { wands: 0, cups: 0, swords: 0, pentacles: 0 };
    let upright = 0;
    let reversed = 0;

    drawnCards.forEach(cardInstance => {
      const card = getCardById(cardInstance.cardId);
      if (!card) return;

      // Count major arcana
      if (card.arcana === 'major') {
        majorArcana++;
      } else {
        // Count suits (only for minor arcana)
        if (card.suit === 'wands') suits.wands++;
        else if (card.suit === 'cups') suits.cups++;
        else if (card.suit === 'swords') suits.swords++;
        else if (card.suit === 'pentacles') suits.pentacles++;
      }

      // Count upright vs reversed
      if (cardInstance.isReversed) {
        reversed++;
      } else {
        upright++;
      }
    });

    return { majorArcana, suits, upright, reversed };
  }, [drawnCards, getCardById]);

  return (
    <div className={`drawn-cards-log ${isMinimized ? 'minimized' : ''}`}>
      <div className="drawn-cards-log-header" onClick={onToggleMinimize} style={{ cursor: 'pointer' }}>
        <span>Session Log</span>
        <span className="drawn-cards-log-toggle">{isMinimized ? '▼' : '▲'}</span>
      </div>
      {!isMinimized && (
        <>
          {drawnCards.length > 0 && (
            <div className="drawn-cards-log-stats">
              <div className="drawn-cards-log-stat-row">
                <span className="drawn-cards-log-stat-label">Major Arcana:</span>
                <span className="drawn-cards-log-stat-value">{stats.majorArcana}</span>
              </div>
              <div className="drawn-cards-log-stat-row">
                <span className="drawn-cards-log-stat-label">Wands:</span>
                <span className="drawn-cards-log-stat-value">{stats.suits.wands}</span>
              </div>
              <div className="drawn-cards-log-stat-row">
                <span className="drawn-cards-log-stat-label">Cups:</span>
                <span className="drawn-cards-log-stat-value">{stats.suits.cups}</span>
              </div>
              <div className="drawn-cards-log-stat-row">
                <span className="drawn-cards-log-stat-label">Swords:</span>
                <span className="drawn-cards-log-stat-value">{stats.suits.swords}</span>
              </div>
              <div className="drawn-cards-log-stat-row">
                <span className="drawn-cards-log-stat-label">Pentacles:</span>
                <span className="drawn-cards-log-stat-value">{stats.suits.pentacles}</span>
              </div>
              <div className="drawn-cards-log-stat-row">
                <span className="drawn-cards-log-stat-label">Upright:</span>
                <span className="drawn-cards-log-stat-value">{stats.upright}</span>
              </div>
              <div className="drawn-cards-log-stat-row">
                <span className="drawn-cards-log-stat-label">Reversed:</span>
                <span className="drawn-cards-log-stat-value">{stats.reversed}</span>
              </div>
            </div>
          )}
          <div className="drawn-cards-log-list">
            {drawnCards.length === 0 ? (
              <div className="drawn-cards-log-empty">No cards drawn yet</div>
            ) : (
              drawnCards.map((cardInstance, index) => {
                const card = getCardById(cardInstance.cardId);
                if (!card) return null;
                return (
                  <div key={cardInstance.id} className="drawn-cards-log-item">
                    <span className="drawn-cards-log-index">{index + 1}.</span>
                    <span className="drawn-cards-log-name">{card.name}</span>
                    <span className={`drawn-cards-log-arrow ${cardInstance.isReversed ? 'reversed' : 'upright'}`}>
                      {cardInstance.isReversed ? '↓' : '↑'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DrawnCardsLog;

