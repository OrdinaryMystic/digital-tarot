import { useState, useCallback, useRef } from 'react';
import { CardInstance, Card } from '../types';
import { calculateDrawPosition, DrawPosition, isAtDiscardPosition } from '../utils/cardPositioning';

export interface UseCardStackReturn {
  drawnCards: CardInstance[];
  drawCard: (card: Card, isReversed: boolean, seed?: number, deckId?: 'top' | 'bottom' | 'main', faceUp?: boolean) => void;
  updateCard: (card: CardInstance) => void;
  clearCards: () => void;
  getNextZIndex: () => number;
  bringToFront: (cardId: string) => number;
  returnCard: (cardInstanceId: string) => CardInstance | null;
  returnAllCards: () => CardInstance[];
}

export const useCardStack = (): UseCardStackReturn => {
  const [drawnCards, setDrawnCards] = useState<CardInstance[]>([]);
  const nextZIndexRef = useRef(1);

  const drawCard = useCallback((card: Card, isReversed: boolean, seed?: number, deckId?: 'top' | 'bottom' | 'main', faceUp: boolean = true) => {
    setDrawnCards(prev => {
      // Find the last card that's still at the discard position for this deck (hasn't been moved)
      // If no cards or last card was moved, use undefined to get discard position
      let lastCard: CardInstance | undefined = undefined;
      if (prev.length > 0) {
        // Check cards in reverse order to find the most recent one at the discard position for this deck
        for (let i = prev.length - 1; i >= 0; i--) {
          const card = prev[i];
          if (isAtDiscardPosition(card.position, deckId)) {
            lastCard = card;
            break;
          }
        }
      }
      
      const lastPosition: DrawPosition | undefined = lastCard
        ? { x: lastCard.position.x, y: lastCard.position.y, rotation: lastCard.rotation }
        : undefined;

      const drawPos = calculateDrawPosition(lastPosition, seed, deckId);

      const newCardInstance: CardInstance = {
        id: `card-instance-${Date.now()}-${Math.random()}`,
        cardId: card.id,
        position: { x: drawPos.x, y: drawPos.y },
        rotation: drawPos.rotation,
        isReversed,
        isFlipped: faceUp, // Use the faceUp parameter
        zIndex: nextZIndexRef.current,
        drawnAt: new Date(),
      };

      nextZIndexRef.current += 1;
      return [...prev, newCardInstance];
    });
  }, []);

  const updateCard = useCallback((updatedCard: CardInstance) => {
    setDrawnCards(prev => {
      // Preserve the highest z-index if the card was already brought to front
      return prev.map(card => {
        if (card.id === updatedCard.id) {
          // Keep the higher z-index (either from bringToFront or from the update)
          return { ...updatedCard, zIndex: Math.max(card.zIndex, updatedCard.zIndex) };
        }
        return card;
      });
    });
  }, []);

  const clearCards = useCallback(() => {
    setDrawnCards([]);
    nextZIndexRef.current = 1;
  }, []);

  const getNextZIndex = useCallback(() => {
    return nextZIndexRef.current;
  }, []);

  const bringToFront = useCallback((cardId: string): number => {
    // Get the next z-index and increment
    const newZIndex = nextZIndexRef.current;
    nextZIndexRef.current += 1;
    
    setDrawnCards(prev => {
      const card = prev.find(c => c.id === cardId);
      if (!card) return prev;
      
      // Update the card with the new z-index
      return prev.map(c => (c.id === cardId ? { ...c, zIndex: newZIndex } : c));
    });
    
    // Return the new z-index so the interaction hook can use it immediately
    return newZIndex;
  }, []);

  const returnCard = useCallback((cardInstanceId: string): CardInstance | null => {
    let returnedCard: CardInstance | null = null;
    setDrawnCards(prev => {
      const card = prev.find(c => c.id === cardInstanceId);
      if (!card) return prev;
      returnedCard = card;
      return prev.filter(c => c.id !== cardInstanceId);
    });
    return returnedCard;
  }, []);

  const returnAllCards = useCallback((): CardInstance[] => {
    let allCards: CardInstance[] = [];
    setDrawnCards(prev => {
      allCards = [...prev];
      return [];
    });
    return allCards;
  }, []);

  return {
    drawnCards,
    drawCard,
    updateCard,
    clearCards,
    getNextZIndex,
    bringToFront,
    returnCard,
    returnAllCards,
  };
};

