import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardInstance } from './types';
import { DeckCard } from './types/deck';
import { createFullDeck } from './utils/tarotDeck';
import { setDeckPosition as setDeckPositionUtil, setTopHalfPosition as setTopHalfPositionUtil, setBottomHalfPosition as setBottomHalfPositionUtil } from './utils/cardPositioning';
import seedrandom from 'seedrandom';
import { useMysticalShuffle } from './hooks/useMysticalShuffle';
import { completeRandomize } from './utils/realisticShuffle';
import { useCardStack } from './hooks/useCardStack';
import { useCardInteraction } from './hooks/useCardInteraction';
import Table from './components/Table';
import Deck from './components/Deck';
import IconButton from './components/IconButton';
import DrawnCardsLog from './components/DrawnCardsLog';
import { ShuffleNotification, OverhandShuffleIndicator } from './components/ShuffleNotification';
import Instructions from './components/Instructions';
import DropZone from './components/DropZone';
import { MobileWarning } from './components/MobileWarning';
import { track, trackEvent, updateReadingState, resetReadingState } from './utils/analytics';
import { FeedbackPrompt } from './components/FeedbackPrompt';
import { useFeedbackPrompt } from './hooks/useFeedbackPrompt';
import './App.css';

function App() {
  // Initialize deck with all cards upright
  let deckInit: DeckCard[] = [];
  try {
    const fullDeck = createFullDeck();
    deckInit = fullDeck.map(card => ({ card, isReversed: false }));
  } catch (error) {
    throw error;
  }
  const [deck, setDeck] = useState<DeckCard[]>(deckInit);
  const [isSplit, setIsSplit] = useState(false);
  const [topHalf, setTopHalf] = useState<DeckCard[]>([]);
  const [bottomHalf, setBottomHalf] = useState<DeckCard[]>([]);
  const [topHalfPosition, setTopHalfPosition] = useState(() => ({ 
    x: typeof window !== 'undefined' ? (window.innerWidth / 2 - 60) : 600, 
    y: 200 
  }));
  const [bottomHalfPosition, setBottomHalfPosition] = useState(() => ({ 
    x: typeof window !== 'undefined' ? (window.innerWidth / 2 - 60) : 600, 
    y: 400 
  }));
  // Detect mobile device
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // On mobile, start with smaller zoom (0.3 = 30%) to fit more on screen
  // Desktop starts at 100% (1.0)
  const [zoom, setZoom] = useState(isMobile ? 0.3 : 1); // Zoom scale factor (1 = 100%)
  const [deckPosition, setDeckPosition] = useState(() => ({ 
    x: typeof window !== 'undefined' ? (window.innerWidth / 2 - 60) : 600, 
    y: 200 // Position on table surface (below top bar)
  })); // Deck position (relative to table surface)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 }); // Canvas pan offset
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isDraggingDeck, setIsDraggingDeck] = useState(false);
  const [deckDragStart, setDeckDragStart] = useState({ x: 0, y: 0 });
  const [draggedDeckId, setDraggedDeckId] = useState<'top' | 'bottom' | null>(null);
  const [shuffleNotification, setShuffleNotification] = useState<{ message: string; key: number } | null>(null);
  const [sessionLog, setSessionLog] = useState<CardInstance[]>([]);
  const [drawFaceUp, setDrawFaceUp] = useState(true);
  // Initialize minimized on mobile devices
  // Session log drawer - closed by default
  const [isSessionLogOpen, setIsSessionLogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [dismissMobileWarning, setDismissMobileWarning] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [dropZoneBounds, setDropZoneBounds] = useState<{ left: number; right: number; top: number; bottom: number } | null>(null);
  const [topHalfDropZoneBounds, setTopHalfDropZoneBounds] = useState<{ left: number; right: number; top: number; bottom: number } | null>(null);
  const [bottomHalfDropZoneBounds, setBottomHalfDropZoneBounds] = useState<{ left: number; right: number; top: number; bottom: number } | null>(null);
  
  const {
    shuffleOnce,
    isShuffling: isContinuousShuffling,
    startShuffling,
    stopShuffling,
    seedGenerator,
  } = useMysticalShuffle();

  const { drawnCards, drawCard, updateCard, bringToFront, returnCard, returnAllCards } = useCardStack();
  const deckRef = React.useRef<HTMLDivElement>(null);
  const topHalfRef = React.useRef<HTMLDivElement>(null);
  const bottomHalfRef = React.useRef<HTMLDivElement>(null);

  // Get card data for drawn cards
  const getCardById = useCallback((cardId: string): Card | undefined => {
    const fullDeck = createFullDeck();
    return fullDeck.find(card => card.id === cardId);
  }, []);

  // Handle returning a single card to the deck at a random position
  const handleReturnCard = useCallback((cardInstance: CardInstance) => {
    trackEvent('return_card', { card_id: cardInstance.cardId });
    
    // Remove the card from drawnCards first
    const returned = returnCard(cardInstance.id);
    
    // Use the cardInstance directly if returnCard didn't find it (shouldn't happen, but fallback)
    const cardData = returned || cardInstance;
    
    // Get the card definition
    const card = getCardById(cardData.cardId);
    if (card) {
      const deckCard = { card, isReversed: cardData.isReversed };
      
      if (isSplit) {
        // If split, add to bottom half
        setBottomHalf(prev => {
          const newHalf = [...prev, deckCard];
          // Only shuffle if we have more than 1 card
          return newHalf.length > 1 ? shuffleOnce(newHalf) : newHalf;
        });
      } else {
        // Add card to deck - always create a new array to ensure React detects the change
        setDeck(prev => {
          // Create new array with the card added
          const newDeck = [...prev, deckCard];
          // Only shuffle if we have more than 1 card (shuffling 1 card is pointless)
          return newDeck.length > 1 ? shuffleOnce(newDeck) : newDeck;
        });
      }
    }
  }, [returnCard, getCardById, shuffleOnce, isSplit]);

  // Handle drag end - check if card was dropped on deck
  const handleDragEndWithCheck = useCallback((e: MouseEvent, cardId: string) => {
    // Check if card was dropped in the drop zone using actual DOM bounds
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const padding = 20; // Padding for easier dropping
    
    let inBounds = false;
    
    if (isSplit) {
      // Check both drop zones for split decks
      const inTopBounds = topHalfDropZoneBounds ? (
        mouseX >= topHalfDropZoneBounds.left - padding &&
        mouseX <= topHalfDropZoneBounds.right + padding &&
        mouseY >= topHalfDropZoneBounds.top - padding &&
        mouseY <= topHalfDropZoneBounds.bottom + padding
      ) : false;
      
      const inBottomBounds = bottomHalfDropZoneBounds ? (
        mouseX >= bottomHalfDropZoneBounds.left - padding &&
        mouseX <= bottomHalfDropZoneBounds.right + padding &&
        mouseY >= bottomHalfDropZoneBounds.top - padding &&
        mouseY <= bottomHalfDropZoneBounds.bottom + padding
      ) : false;
      
      inBounds = inTopBounds || inBottomBounds;
    } else {
      // Check single drop zone for normal deck
      // Even if deck is empty, drop zone should still work (invisible placeholder maintains position)
      if (dropZoneBounds) {
        inBounds = (
          mouseX >= dropZoneBounds.left - padding &&
          mouseX <= dropZoneBounds.right + padding &&
          mouseY >= dropZoneBounds.top - padding &&
          mouseY <= dropZoneBounds.bottom + padding
        );
      }
    }
    
    if (inBounds) {
      // Find the card that was being dragged
      const cardInstance = drawnCards.find(c => c.id === cardId);
      if (cardInstance) {
        handleReturnCard(cardInstance);
      }
    }
  }, [drawnCards, handleReturnCard, dropZoneBounds, topHalfDropZoneBounds, bottomHalfDropZoneBounds, isSplit]);

  const { dragStart, rotateStart, handleDoubleClick, isDragging, isRotating } = useCardInteraction(updateCard, bringToFront, handleDragEndWithCheck, zoom, panOffset);

  // Handle card selection
  const handleCardSelect = useCallback((cardId: string) => {
    setSelectedCardId(prev => prev === cardId ? null : cardId);
  }, []);

  // Handle clicking outside cards to deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't deselect if clicking on a card, deck, or UI elements
      if (!target.closest('.card, .deck, .top-bar, .session-log-drawer, .session-log-drawer-handle, .session-log-overlay')) {
        setSelectedCardId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Track reading completion state for feedback prompt
  const [hasCompletedReading, setHasCompletedReading] = useState(false);

  // Monitor for reading completion
  useEffect(() => {
    const checkInterval = setInterval(() => {
      // Check if reading was completed by checking localStorage
      const readingCompleted = localStorage.getItem('digital-tarot-reading-completed') === 'true';
      if (readingCompleted && !hasCompletedReading) {
        setHasCompletedReading(true);
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [hasCompletedReading]);

  // Feedback prompt hook
  const {
    showPrompt: showFeedbackPrompt,
    handleClose: handleFeedbackClose,
    handleShareFeedback,
    handleMaybeLater,
    handleNoThanks,
  } = useFeedbackPrompt({
    isDragging,
    isRotating,
    isShuffling: isContinuousShuffling,
    showInstructions,
    hasCompletedReading,
  });

  // Track session start
  useEffect(() => {
    track('session_start');
    resetReadingState();
  }, []);

  // Check if instructions have been shown before
  useEffect(() => {
    const hasSeenInstructions = localStorage.getItem('digital-tarot-has-seen-instructions');
    if (!hasSeenInstructions) {
      setShowInstructions(true);
      localStorage.setItem('digital-tarot-has-seen-instructions', 'true');
    }
  }, []);

  // Handle drawing a card from the deck (or from split decks)
  const handleDrawCard = useCallback((fromTopHalf: boolean = false) => {
    // Deselect any selected card when drawing a new one
    setSelectedCardId(null);
    
    if (isSplit) {
      if (fromTopHalf) {
        if (topHalf.length === 0) return;
        const topCard = topHalf[0];
        const seed = seedGenerator.generateSeed();
        drawCard(topCard.card, topCard.isReversed, seed, 'top', drawFaceUp);
        setTopHalf(prev => prev.slice(1));
        // Track draw_card event
        track('draw_card', {
          face_up: drawFaceUp,
          deck_mode: 'split',
          source_pile: 'left',
        });
        updateReadingState((prev) => ({ drawCount: prev.drawCount + 1 }));
      } else {
        if (bottomHalf.length === 0) return;
        const bottomCard = bottomHalf[0];
        const seed = seedGenerator.generateSeed();
        drawCard(bottomCard.card, bottomCard.isReversed, seed, 'bottom', drawFaceUp);
        setBottomHalf(prev => prev.slice(1));
        // Track draw_card event
        track('draw_card', {
          face_up: drawFaceUp,
          deck_mode: 'split',
          source_pile: 'right',
        });
        updateReadingState((prev) => ({ drawCount: prev.drawCount + 1 }));
      }
    } else {
      if (deck.length === 0) return;
      const topDeckCard = deck[0];
      const seed = seedGenerator.generateSeed();
      drawCard(topDeckCard.card, topDeckCard.isReversed, seed, 'main', drawFaceUp);
      setDeck(prev => prev.slice(1));
      // Track draw_card event
      track('draw_card', {
        face_up: drawFaceUp,
        deck_mode: 'normal',
        source_pile: 'main',
      });
      updateReadingState((prev) => ({ drawCount: prev.drawCount + 1 }));
    }
  }, [deck, topHalf, bottomHalf, isSplit, drawCard, seedGenerator, drawFaceUp]);

  // Auto-rejoin split decks when one becomes empty
  useEffect(() => {
    if (isSplit) {
      // If top half is empty but bottom half has cards, rejoin
      if (topHalf.length === 0 && bottomHalf.length > 0) {
        setDeck([...bottomHalf]);
        setIsSplit(false);
        setBottomHalf([]);
        setTopHalfPositionUtil(null);
        setBottomHalfPositionUtil(null);
        setDeckPosition(bottomHalfPosition);
      }
      // If bottom half is empty but top half has cards, rejoin
      else if (bottomHalf.length === 0 && topHalf.length > 0) {
        setDeck([...topHalf]);
        setIsSplit(false);
        setTopHalf([]);
        setTopHalfPositionUtil(null);
        setBottomHalfPositionUtil(null);
        setDeckPosition(topHalfPosition);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSplit, topHalf.length, bottomHalf.length]);


  // Update session log when cards are drawn
  useEffect(() => {
    // Add any new cards to the session log
    const newCards = drawnCards.filter(dc => !sessionLog.find(logCard => logCard.id === dc.id));
    if (newCards.length > 0) {
      setSessionLog(prev => [...prev, ...newCards]);
    }
  }, [drawnCards, sessionLog]);

  // Handle shuffle once (riffle shuffle)
  const handleShuffleOnce = useCallback(() => {
    track('shuffle_used', { mode: 'riffle' });
    updateReadingState({ hasShuffled: true });
    
    if (isSplit) {
      // Rejoin the two halves and shuffle them together with riffle shuffle
      const combinedDeck = [...topHalf, ...bottomHalf];
      setShuffleNotification({ message: 'Shuffling...', key: Date.now() });
      setTimeout(() => {
        const shuffled = shuffleOnce(combinedDeck);
        setDeck(shuffled);
        setIsSplit(false);
        setTopHalf([]);
        setBottomHalf([]);
        // Reset deck position to the average of the two halves
        const avgX = (topHalfPosition.x + bottomHalfPosition.x) / 2;
        const avgY = (topHalfPosition.y + bottomHalfPosition.y) / 2;
        setDeckPosition({ x: avgX, y: avgY });
        setTopHalfPositionUtil(null);
        setBottomHalfPositionUtil(null);
        setShuffleNotification({ message: 'Shuffled!', key: Date.now() });
        setTimeout(() => setShuffleNotification(null), 800);
      }, 300);
    } else {
      // Riffle shuffle handles reversals internally
      setShuffleNotification({ message: 'Shuffling...', key: Date.now() });
      setTimeout(() => {
        const shuffled = shuffleOnce(deck);
        setDeck(shuffled);
        setShuffleNotification({ message: 'Shuffled!', key: Date.now() });
        setTimeout(() => setShuffleNotification(null), 800);
      }, 300);
    }
  }, [deck, topHalf, bottomHalf, isSplit, shuffleOnce, topHalfPosition, bottomHalfPosition]);

  // Handle split deck - creates two separate decks
  const handleSplitDeck = useCallback(() => {
    if (isSplit) {
      // Rejoin decks - bottom half goes on top
      setDeck([...bottomHalf, ...topHalf]);
      setIsSplit(false);
      setTopHalf([]);
      setBottomHalf([]);
    } else {
      if (deck.length < 2) return;
      track('shuffle_used', { mode: 'split' });
      updateReadingState({ hasShuffled: true });
      const midpoint = Math.floor(deck.length / 2);
      const firstHalf = deck.slice(0, midpoint);
      const secondHalf = deck.slice(midpoint);
      // Position the two halves vertically (one on top of the other)
      const currentX = deckPosition.x;
      const currentY = deckPosition.y;
      const cardHeight = 240; // Card height in pixels
      const spacing = 20; // Extra spacing between decks
      const topPos = { x: currentX, y: currentY };
      const bottomPos = { x: currentX, y: currentY + cardHeight + spacing };
      
      // Set positions in state FIRST, then set isSplit
      // This ensures positions are available when isSplit becomes true
      setTopHalfPosition(topPos);
      setBottomHalfPosition(bottomPos);
      
      // Set positions immediately in the positioning utility (synchronous)
      setTopHalfPositionUtil(topPos);
      setBottomHalfPositionUtil(bottomPos);
      
      // Then update deck state and split flag
      setTopHalf(firstHalf);
      setBottomHalf(secondHalf);
      setDeck([]);
      setIsSplit(true);
    }
  }, [deck, isSplit, topHalf, bottomHalf, deckPosition]);

  // Handle spin deck - randomly reverse cards while keeping order
  const handleSpinDeck = useCallback(() => {
    track('shuffle_used', { mode: 'spin' });
    updateReadingState({ hasShuffled: true });
    
    if (isSplit) {
      if (topHalf.length === 0 && bottomHalf.length === 0) return;
      const seed = seedGenerator.generateSeed();
      seedGenerator.trackClick();
      
      setShuffleNotification({ message: 'Spinning...', key: Date.now() });
      setTimeout(() => {
        // Spin each half separately
        const rng = seedrandom(seed.toString());
        setTopHalf(prev => prev.map(dc => ({ ...dc, isReversed: rng() < 0.5 })));
        setBottomHalf(prev => prev.map(dc => ({ ...dc, isReversed: rng() < 0.5 })));
        setShuffleNotification({ message: 'Spun!', key: Date.now() });
        setTimeout(() => setShuffleNotification(null), 800);
      }, 300);
    } else {
      if (deck.length === 0) return;
      const seed = seedGenerator.generateSeed();
      seedGenerator.trackClick();
      
      setShuffleNotification({ message: 'Spinning...', key: Date.now() });
      setTimeout(() => {
        // Use seeded random to determine reversals
        const rng = (() => {
          let seedValue = seed;
          return () => {
            seedValue = (seedValue * 9301 + 49297) % 233280;
            return seedValue / 233280;
          };
        })();
        
        setDeck(prev => prev.map(deckCard => ({
          ...deckCard,
          isReversed: rng() < 0.5, // 50% chance to be reversed
        })));
        setShuffleNotification({ message: 'Spun!', key: Date.now() });
        setTimeout(() => setShuffleNotification(null), 800);
      }, 300);
    }
  }, [deck, topHalf, bottomHalf, isSplit, seedGenerator]);

  // Handle complete randomization of the deck
  const handleRandomizeDeck = useCallback(() => {
    track('shuffle_used', { mode: 'randomize' });
    updateReadingState({ hasShuffled: true });
    
    if (isSplit) {
      // Rejoin the two halves before randomizing
      const combinedDeck = [...topHalf, ...bottomHalf];
      setShuffleNotification({ message: 'Randomizing...', key: Date.now() });
      setTimeout(() => {
        // Use complete randomization (does 15-20 shuffle operations for thorough mixing)
        const seed = seedGenerator.generateSeed();
        seedGenerator.trackClick();
        const randomized = completeRandomize(combinedDeck, seed);
        setDeck(randomized);
        setIsSplit(false);
        setTopHalf([]);
        setBottomHalf([]);
        // Reset deck position to the average of the two halves
        const avgX = (topHalfPosition.x + bottomHalfPosition.x) / 2;
        const avgY = (topHalfPosition.y + bottomHalfPosition.y) / 2;
        setDeckPosition({ x: avgX, y: avgY });
        setTopHalfPositionUtil(null);
        setBottomHalfPositionUtil(null);
        setShuffleNotification({ message: 'Randomized!', key: Date.now() });
        setTimeout(() => setShuffleNotification(null), 800);
      }, 300);
    } else {
      if (deck.length === 0) return;
      setShuffleNotification({ message: 'Randomizing...', key: Date.now() });
      setTimeout(() => {
        // Use complete randomization (does 15-20 shuffle operations for thorough mixing)
        const seed = seedGenerator.generateSeed();
        seedGenerator.trackClick();
        const randomized = completeRandomize(deck, seed);
        setDeck(randomized);
        setShuffleNotification({ message: 'Randomized!', key: Date.now() });
        setTimeout(() => setShuffleNotification(null), 800);
      }, 300);
    }
  }, [deck, topHalf, bottomHalf, isSplit, seedGenerator, topHalfPosition, bottomHalfPosition]);

  // Continuous overhand shuffling effect (chunk by chunk)
  const overhandStateRef = React.useRef<{
    state: { remaining: DeckCard[]; result: DeckCard[]; isComplete: boolean } | null;
    chunkIndex: number;
  }>({ state: null, chunkIndex: 0 });
  const hasInitializedShuffleRef = React.useRef(false);

  useEffect(() => {
    if (isContinuousShuffling) {
      // Only rejoin if this is the first time starting shuffle (not already shuffling)
      if (!hasInitializedShuffleRef.current) {
        if (isSplit) {
          // Rejoin the two halves before starting shuffle
          const combinedDeck = [...topHalf, ...bottomHalf];
          setDeck(combinedDeck);
          setIsSplit(false);
          setTopHalf([]);
          setBottomHalf([]);
          // Reset deck position to the average of the two halves
          const avgX = (topHalfPosition.x + bottomHalfPosition.x) / 2;
          const avgY = (topHalfPosition.y + bottomHalfPosition.y) / 2;
          setDeckPosition({ x: avgX, y: avgY });
          setTopHalfPositionUtil(null);
          setBottomHalfPositionUtil(null);
          // Initialize with the combined deck
          overhandStateRef.current = {
            state: {
              remaining: [...combinedDeck],
              result: [],
              isComplete: false,
            },
            chunkIndex: 0,
          };
        } else {
          // Initialize overhand shuffle state with current deck
          overhandStateRef.current = {
            state: {
              remaining: [...deck],
              result: [],
              isComplete: false,
            },
            chunkIndex: 0,
          };
        }
        hasInitializedShuffleRef.current = true;
      }

      const interval = setInterval(() => {
        setDeck(prevDeck => {
          const state = overhandStateRef.current.state;
          if (!state) {
            overhandStateRef.current.state = {
              remaining: [...prevDeck],
              result: [],
              isComplete: false,
            };
            return prevDeck;
          }

          // Process one chunk
          if (state.remaining.length === 0 && state.result.length > 0) {
            // Start a new pass - move result back to remaining
            state.remaining = [...state.result];
            state.result = [];
          }

          if (state.remaining.length === 0) {
            // Complete - return the result
            const finalDeck = state.result;
            overhandStateRef.current.state = {
              remaining: [...finalDeck],
              result: [],
              isComplete: false,
            };
            overhandStateRef.current.chunkIndex = 0;
            return finalDeck;
          }

          // Process one chunk
          const seed = seedGenerator.generateSeed() + overhandStateRef.current.chunkIndex;
          const rng = (() => {
            let seedValue = seed;
            return () => {
              seedValue = (seedValue * 9301 + 49297) % 233280;
              return seedValue / 233280;
            };
          })();

          // Determine chunk size to take from top (1-5 cards for more realistic shuffling)
          const maxChunkSize = Math.min(5, Math.floor(state.remaining.length * 0.2));
          const chunkSize = Math.floor(rng() * maxChunkSize) + 1;
          const actualChunkSize = Math.min(chunkSize, state.remaining.length);

          // Take chunk from top
          const chunk = state.remaining.slice(0, actualChunkSize);
          state.remaining = state.remaining.slice(actualChunkSize);

          // Decide where to place it
          const position = rng();
          if (position < 0.3) {
            // Place at beginning
            state.result.unshift(...chunk);
          } else if (position < 0.7 && state.result.length > 0) {
            // Place in middle
            const insertIndex = Math.floor(rng() * state.result.length);
            state.result.splice(insertIndex, 0, ...chunk);
          } else {
            // Place at end
            state.result.push(...chunk);
          }

          overhandStateRef.current.chunkIndex += 1;

          // Return current state (remaining + result)
          return [...state.remaining, ...state.result];
        });
      }, 150); // Process one chunk every 150ms (like dropping chunks)
      return () => clearInterval(interval);
    } else {
      // Reset state when stopping
      overhandStateRef.current = { state: null, chunkIndex: 0 };
      hasInitializedShuffleRef.current = false;
    }
  }, [isContinuousShuffling, deck, seedGenerator, isSplit, topHalf, bottomHalf, topHalfPosition, bottomHalfPosition]);


  // Handle returning all cards to the deck
  const handleReturnAllCards = useCallback(() => {
    track('return_all_cards');
    const allReturned = returnAllCards();
    const fullDeck = createFullDeck();
    
    // Add all returned cards back to the deck with their reversal states
    const cardsToAdd: DeckCard[] = allReturned.map(cardInstance => {
      const card = fullDeck.find(c => c.id === cardInstance.cardId);
      return {
        card: card || fullDeck[0], // Fallback (shouldn't happen)
        isReversed: cardInstance.isReversed,
      };
    });
    
    if (isSplit) {
      // If split, add all cards to bottom half
      setBottomHalf(prev => {
        const newHalf = [...prev, ...cardsToAdd];
        return shuffleOnce(newHalf);
      });
    } else {
      setDeck(prev => {
        const newDeck = [...prev, ...cardsToAdd];
        return shuffleOnce(newDeck);
      });
    }
  }, [returnAllCards, isSplit, shuffleOnce, seedGenerator]);

  // Check if deck has been modified from original state
  const isDeckModified = useCallback(() => {
    // Check if deck has been shuffled (any reversed cards or not in original order)
    const fullDeck = createFullDeck();
    if (deck.length !== 78) return true;
    if (isSplit) return true;
    
    // Check if any cards are reversed (original deck has all upright)
    const hasReversedCards = deck.some(dc => dc.isReversed);
    if (hasReversedCards) return true;
    
    // Check if deck order is different from original
    const originalOrder = fullDeck.map(c => c.id);
    const currentOrder = deck.map(dc => dc.card.id);
    const isOrderDifferent = originalOrder.some((id, index) => id !== currentOrder[index]);
    if (isOrderDifferent) return true;
    
    return false;
  }, [deck, isSplit]);

  // Handle reset all - return cards and reset deck to original order
  const handleResetAll = useCallback(() => {
    track('reset_session');
    resetReadingState();
    // Return all drawn cards
    returnAllCards();
    
    // Clear session log
    setSessionLog([]);
    
    // Reset deck to original order (all upright)
    const fullDeck = createFullDeck();
    setDeck(fullDeck.map(card => ({ card, isReversed: false })));
    
    // Clear any split state
    setIsSplit(false);
    setTopHalf([]);
    setBottomHalf([]);
  }, [returnAllCards]);

  // Handle table panning (mouse and touch)
  const handlePanStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Don't pan if clicking on a card or deck
    const target = e.target as HTMLElement;
    if (target.closest('.card, .deck, [data-card-id], .session-log-drawer, .session-log-drawer-handle, .session-log-overlay')) {
      return;
    }
    
    // Prevent default for touch to avoid scrolling
    if ('touches' in e) {
      e.preventDefault();
    }
    
    setIsPanning(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setPanStart({ x: clientX - panOffset.x, y: clientY - panOffset.y });
  }, [panOffset]);

  useEffect(() => {
    if (!isPanning) return;

    // Optimize for mobile: use direct state updates with RAF batching for smooth performance
    let rafId: number | null = null;
    let pendingUpdate: { x: number; y: number } | null = null;

    const handlePanMove = (e: MouseEvent | TouchEvent) => {
      // Prevent default for touch to avoid scrolling
      if ('touches' in e) {
        e.preventDefault();
      }
      
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      
      // Store pending update
      pendingUpdate = {
        x: clientX - panStart.x,
        y: clientY - panStart.y,
      };

      // Batch updates using RAF for smooth performance
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          if (pendingUpdate) {
            setPanOffset(pendingUpdate);
            pendingUpdate = null;
          }
          rafId = null;
        });
      }
    };

    const handlePanEnd = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      setIsPanning(false);
    };

    document.addEventListener('mousemove', handlePanMove);
    document.addEventListener('mouseup', handlePanEnd);
    document.addEventListener('touchmove', handlePanMove, { passive: false });
    document.addEventListener('touchend', handlePanEnd);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      document.removeEventListener('mousemove', handlePanMove);
      document.removeEventListener('mouseup', handlePanEnd);
      document.removeEventListener('touchmove', handlePanMove);
      document.removeEventListener('touchend', handlePanEnd);
    };
  }, [isPanning, panStart, isMobile]);

  // Handle deck dragging
  const handleDeckMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingDeck(true);
    // Calculate drag start relative to table surface (accounting for pan and zoom)
    const tableX = (e.clientX - panOffset.x) / zoom;
    const tableY = (e.clientY - panOffset.y) / zoom;
    setDeckDragStart({
      x: tableX - deckPosition.x,
      y: tableY - deckPosition.y,
    });
  }, [deckPosition, panOffset, zoom]);

  useEffect(() => {
    if (!isDraggingDeck) return;

    const handleDeckMove = (e: MouseEvent) => {
      // Calculate position relative to table surface (accounting for pan and zoom)
      // Mouse position minus pan offset, divided by zoom
      const tableX = (e.clientX - panOffset.x) / zoom;
      const tableY = (e.clientY - panOffset.y) / zoom;
      const newPosition = {
        x: tableX - deckDragStart.x,
        y: tableY - deckDragStart.y,
      };
      
      // Update the specific deck being dragged
      if (isSplit && draggedDeckId) {
        if (draggedDeckId === 'top') {
          setTopHalfPosition(newPosition);
        } else {
          setBottomHalfPosition(newPosition);
        }
      } else if (!isSplit) {
        setDeckPosition(newPosition);
      }
    };

    const handleDeckEnd = () => {
      // No longer checking for drag-to-rejoin - only rejoin via button or shuffle
      setIsDraggingDeck(false);
      setDraggedDeckId(null);
    };

    document.addEventListener('mousemove', handleDeckMove);
    document.addEventListener('mouseup', handleDeckEnd);

    return () => {
      document.removeEventListener('mousemove', handleDeckMove);
      document.removeEventListener('mouseup', handleDeckEnd);
    };
  }, [isDraggingDeck, deckDragStart, panOffset, zoom, isSplit, topHalfPosition, bottomHalfPosition, draggedDeckId, topHalf, bottomHalf]);

  // Update deck position in card positioning utility when it changes
  useEffect(() => {
    if (isSplit) {
      setTopHalfPositionUtil(topHalfPosition);
      setBottomHalfPositionUtil(bottomHalfPosition);
    } else {
      setDeckPositionUtil(deckPosition);
      setTopHalfPositionUtil(null);
      setBottomHalfPositionUtil(null);
    }
  }, [deckPosition, topHalfPosition, bottomHalfPosition, isSplit]);

  
  return (
    <div className="app">
      {isMobile && !dismissMobileWarning && (
        <MobileWarning onDismiss={() => setDismissMobileWarning(true)} />
      )}
      <Table
        drawnCards={drawnCards}
        getCardById={getCardById}
        onCardUpdate={updateCard}
        onDragStart={dragStart}
        onRotateStart={rotateStart}
        onDoubleClick={(card) => handleDoubleClick(card, updateCard)}
        onCardSelect={handleCardSelect}
        selectedCardId={selectedCardId}
        isDragging={isDragging}
        zoom={zoom}
        panOffset={panOffset}
        onPanStart={handlePanStart}
        dropZones={
          isDragging ? (
            <>
              {isSplit ? (
                <>
                  <DropZone
                    isVisible={isDragging}
                    position={topHalfPosition}
                    zoom={zoom}
                    panOffset={panOffset}
                    onBoundsUpdate={setTopHalfDropZoneBounds}
                  />
                  <DropZone
                    isVisible={isDragging}
                    position={bottomHalfPosition}
                    zoom={zoom}
                    panOffset={panOffset}
                    onBoundsUpdate={setBottomHalfDropZoneBounds}
                  />
                </>
              ) : (
                <DropZone
                  isVisible={isDragging}
                  position={deckPosition}
                  zoom={zoom}
                  panOffset={panOffset}
                  onBoundsUpdate={setDropZoneBounds}
                />
              )}
            </>
          ) : null
        }
        deckElement={
          isSplit ? (
            <>
              <div 
                ref={topHalfRef}
                style={{
                  position: 'absolute',
                  left: `${topHalfPosition.x}px`,
                  top: `${topHalfPosition.y}px`,
                  width: topHalf.length > 0 ? 'auto' : '140px',
                  height: topHalf.length > 0 ? 'auto' : '240px',
                  minWidth: '140px',
                  minHeight: '240px',
                }}
              >
                {topHalf.length > 0 ? (
                  <Deck
                    cardCount={topHalf.length}
                    onDraw={() => handleDrawCard(true)}
                    deckRef={undefined}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setIsDraggingDeck(true);
                      setDraggedDeckId('top');
                      const tableX = (e.clientX - panOffset.x) / zoom;
                      const tableY = (e.clientY - panOffset.y) / zoom;
                      setDeckDragStart({
                        x: tableX - topHalfPosition.x,
                        y: tableY - topHalfPosition.y,
                      });
                    }}
                  />
                ) : (
                  <div style={{ width: '140px', height: '240px', opacity: 0 }} />
                )}
              </div>
              <div 
                ref={bottomHalfRef}
                style={{
                  position: 'absolute',
                  left: `${bottomHalfPosition.x}px`,
                  top: `${bottomHalfPosition.y}px`,
                  width: bottomHalf.length > 0 ? 'auto' : '140px',
                  height: bottomHalf.length > 0 ? 'auto' : '240px',
                  minWidth: '140px',
                  minHeight: '240px',
                }}
              >
                {bottomHalf.length > 0 ? (
                  <Deck
                    cardCount={bottomHalf.length}
                    onDraw={() => handleDrawCard(false)}
                    deckRef={undefined}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setIsDraggingDeck(true);
                      setDraggedDeckId('bottom');
                      const tableX = (e.clientX - panOffset.x) / zoom;
                      const tableY = (e.clientY - panOffset.y) / zoom;
                      setDeckDragStart({
                        x: tableX - bottomHalfPosition.x,
                        y: tableY - bottomHalfPosition.y,
                      });
                    }}
                  />
                ) : (
                  <div style={{ width: '140px', height: '240px', opacity: 0 }} />
                )}
              </div>
            </>
          ) : (
            <div 
              key={`deck-container-${deck.length}`}
              ref={deckRef}
              style={{
                position: 'absolute',
                left: `${deckPosition.x}px`,
                top: `${deckPosition.y}px`,
                width: deck.length > 0 ? 'auto' : '140px',
                height: deck.length > 0 ? 'auto' : '240px',
                minWidth: '140px',
                minHeight: '240px',
              }}
            >
              {deck.length > 0 ? (
                <Deck
                  cardCount={deck.length}
                  onDraw={() => handleDrawCard()}
                  deckRef={undefined}
                  onMouseDown={handleDeckMouseDown}
                />
              ) : (
                // Invisible placeholder when deck is empty to maintain drop target
                <div style={{ width: '140px', height: '240px', opacity: 0 }} />
              )}
            </div>
          )
        }
      />
      <DrawnCardsLog 
        drawnCards={sessionLog} 
        getCardById={getCardById}
        isOpen={isSessionLogOpen}
        onToggle={() => setIsSessionLogOpen(prev => !prev)}
      />
      {shuffleNotification && (
        <ShuffleNotification
          key={shuffleNotification.key}
          message={shuffleNotification.message}
          duration={shuffleNotification.message === 'Shuffling...' ? 500 : 800}
        />
      )}
      <OverhandShuffleIndicator isActive={isContinuousShuffling} />
      <div className="top-bar">
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          <span className="hamburger-icon">☰</span>
        </button>
        <div className={`action-buttons ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <IconButton
            icon="🔀"
            tooltip="Riffle Shuffle"
            onClick={() => {
              seedGenerator.trackClick();
              handleShuffleOnce();
              setIsMobileMenuOpen(false);
            }}
            disabled={isSplit ? (topHalf.length === 0 && bottomHalf.length === 0) : deck.length === 0}
          />
          <IconButton
            icon={isContinuousShuffling ? "⏹" : "▶"}
            tooltip={isContinuousShuffling ? "Stop Overhand" : "Start Overhand"}
            onClick={() => {
              seedGenerator.trackClick();
              if (isContinuousShuffling) {
                stopShuffling();
              } else {
                track('shuffle_used', { mode: 'overhand' });
                updateReadingState({ hasShuffled: true });
                startShuffling();
              }
              setIsMobileMenuOpen(false);
            }}
            disabled={isSplit ? (topHalf.length === 0 && bottomHalf.length === 0) : deck.length === 0}
            active={isContinuousShuffling}
          />
          <IconButton
            icon={isSplit ? "🔗" : "✂️"}
            tooltip={isSplit ? "Rejoin Decks" : "Split Deck"}
            onClick={() => {
              seedGenerator.trackClick();
              handleSplitDeck();
              setIsMobileMenuOpen(false);
            }}
            disabled={isSplit ? false : deck.length < 2}
          />
          <IconButton
            icon="🌀"
            tooltip="Spin Deck"
            onClick={() => {
              seedGenerator.trackClick();
              handleSpinDeck();
              setIsMobileMenuOpen(false);
            }}
            disabled={isSplit ? (topHalf.length === 0 && bottomHalf.length === 0) : deck.length === 0}
          />
          <IconButton
            icon="🎲"
            tooltip="Randomize Deck"
            onClick={() => {
              seedGenerator.trackClick();
              handleRandomizeDeck();
              setIsMobileMenuOpen(false);
            }}
            disabled={isSplit ? (topHalf.length === 0 && bottomHalf.length === 0) : deck.length === 0}
          />
          <IconButton
            icon={drawFaceUp ? "👁️" : "🙈"}
            tooltip={drawFaceUp ? "Draw Face Up" : "Draw Face Down"}
            onClick={() => {
              seedGenerator.trackClick();
              setDrawFaceUp(prev => !prev);
              setIsMobileMenuOpen(false);
            }}
          />
          <IconButton
            icon="📋"
            tooltip={isSessionLogOpen ? "Close Session Log" : "Open Session Log"}
            onClick={() => {
              seedGenerator.trackClick();
              const newState = !isSessionLogOpen;
              setIsSessionLogOpen(newState);
              if (newState) {
                track('session_log_opened');
                updateReadingState({ hasOpenedLog: true });
              }
              setIsMobileMenuOpen(false);
            }}
            active={isSessionLogOpen}
          />
          <IconButton
            icon="↩️"
            tooltip="Return All Cards"
            onClick={() => {
              seedGenerator.trackClick();
              handleReturnAllCards();
              setIsMobileMenuOpen(false);
            }}
            disabled={drawnCards.length === 0}
          />
          <IconButton
            icon="🔄"
            tooltip="Reset Session"
            onClick={() => {
              seedGenerator.trackClick();
              handleResetAll();
              setIsMobileMenuOpen(false);
            }}
            disabled={sessionLog.length === 0 && !isDeckModified()}
          />
          <IconButton
            icon="❓"
            tooltip="Show Instructions"
            onClick={() => {
              seedGenerator.trackClick();
              track('instructions_opened');
              setShowInstructions(true);
              setIsMobileMenuOpen(false);
            }}
          />
          <div className="zoom-controls">
            <IconButton
              icon="➖"
              tooltip="Zoom Out"
              onClick={() => setZoom(prev => Math.max(isMobile ? 0.2 : 0.5, prev - 0.1))}
            />
            <span className="zoom-value">{Math.round(zoom * 100)}%</span>
            <IconButton
              icon="➕"
              tooltip="Zoom In"
              onClick={() => setZoom(prev => Math.min(isMobile ? 1.5 : 2, prev + 0.1))}
            />
          </div>
        </div>
      </div>
      <Instructions 
        isOpen={showInstructions} 
        onClose={() => setShowInstructions(false)} 
      />
      <FeedbackPrompt
        isOpen={showFeedbackPrompt}
        onClose={handleFeedbackClose}
        onShareFeedback={handleShareFeedback}
        onMaybeLater={handleMaybeLater}
        onNoThanks={handleNoThanks}
      />
    </div>
  );
}

export default App;

