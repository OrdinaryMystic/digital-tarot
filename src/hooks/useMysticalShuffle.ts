import { useState, useRef, useEffect, useCallback } from 'react';
import { DeckCard } from '../types/deck';
import { SeedGenerator } from '../utils/seedGenerator';
import { riffleShuffle } from '../utils/realisticShuffle';

export interface UseMysticalShuffleReturn {
  shuffle: (deck: DeckCard[]) => DeckCard[];
  isShuffling: boolean;
  startShuffling: () => void;
  stopShuffling: () => void;
  shuffleOnce: (deck: DeckCard[]) => DeckCard[];
  seedGenerator: SeedGenerator;
}

export const useMysticalShuffle = (): UseMysticalShuffleReturn => {
  const [isShuffling, setIsShuffling] = useState(false);
  const seedGeneratorRef = useRef(new SeedGenerator());
  const shuffleIntervalRef = useRef<number | null>(null);

  // Riffle shuffle (for "Shuffle Once" button)
  const shuffleOnce = useCallback((deck: DeckCard[]): DeckCard[] => {
    const seed = seedGeneratorRef.current.generateSeed();
    return riffleShuffle(deck, seed);
  }, []);


  // Start continuous shuffling
  const startShuffling = useCallback(() => {
    setIsShuffling(true);
  }, []);

  // Stop continuous shuffling
  const stopShuffling = useCallback(() => {
    setIsShuffling(false);
    if (shuffleIntervalRef.current) {
      clearInterval(shuffleIntervalRef.current);
      shuffleIntervalRef.current = null;
    }
  }, []);

  // Continuous shuffling effect
  useEffect(() => {
    if (isShuffling) {
      // Generate new seed every 100ms while shuffling
      shuffleIntervalRef.current = window.setInterval(() => {
        // Just update the seed generator, actual shuffling happens in component
        seedGeneratorRef.current.generateSeed();
      }, 100);
    } else {
      if (shuffleIntervalRef.current) {
        clearInterval(shuffleIntervalRef.current);
        shuffleIntervalRef.current = null;
      }
    }

    return () => {
      if (shuffleIntervalRef.current) {
        clearInterval(shuffleIntervalRef.current);
      }
    };
  }, [isShuffling]);

  // Track mouse movements globally
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      seedGeneratorRef.current.trackMouseMove(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return {
    shuffle: shuffleOnce,
    isShuffling,
    startShuffling,
    stopShuffling,
    shuffleOnce,
    seedGenerator: seedGeneratorRef.current,
  };
};

