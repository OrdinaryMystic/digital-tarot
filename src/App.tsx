import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardInstance } from './types';
import { DeckCard } from './types/deck';
import { createFullDeck } from './utils/tarotDeck';
import { setDeckPosition as setDeckPositionUtil, setTopHalfPosition as setTopHalfPositionUtil, setBottomHalfPosition as setBottomHalfPositionUtil } from './utils/cardPositioning';
import seedrandom from 'seedrandom';
import { useMysticalShuffle } from './hooks/useMysticalShuffle';
import { useCardStack } from './hooks/useCardStack';
import { useCardInteraction } from './hooks/useCardInteraction';
import Table from './components/Table';
import Deck from './components/Deck';
import IconButton from './components/IconButton';
import DrawnCardsLog from './components/DrawnCardsLog';
import { ShuffleNotification, OverhandShuffleIndicator } from './components/ShuffleNotification';
import Instructions from './components/Instructions';
import './App.css';

function App() {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/2b592729-be1a-46fb-8bcd-2c8271753022',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:15',message:'App component entry',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C,D'})}).catch(()=>{});
  // #endregion
  
  // Initialize deck with all cards upright
  let deckInit: DeckCard[] = [];
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2b592729-be1a-46fb-8bcd-2c8271753022',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:20',message:'Before createFullDeck',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C,D'})}).catch(()=>{});
    // #endregion
    const fullDeck = createFullDeck();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2b592729-be1a-46fb-8bcd-2c8271753022',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:24',message:'After createFullDeck',data:{deckLength:fullDeck.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C,D'})}).catch(()=>{});
    // #endregion
    deckInit = fullDeck.map(card => ({ card, isReversed: false }));
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2b592729-be1a-46fb-8bcd-2c8271753022',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:28',message:'Error in deck init',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C,D'})}).catch(()=>{});
    // #endregion
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
  const [zoom, setZoom] = useState(1); // Zoom scale factor (1 = 100%)
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
  const [deckWasDragged, setDeckWasDragged] = useState(false);
  const [shuffleNotification, setShuffleNotification] = useState<{ message: string; key: number } | null>(null);
  const [sessionLog, setSessionLog] = useState<CardInstance[]>([]);
  const [drawFaceUp, setDrawFaceUp] = useState(true);
  // Initialize minimized on mobile devices
  // Session log drawer - closed by default
  const [isSessionLogOpen, setIsSessionLogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/2b592729-be1a-46fb-8bcd-2c8271753022',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:35',message:'Before useMysticalShuffle',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C,E'})}).catch(()=>{});
  // #endregion
  const {
    shuffleOnce,
    isShuffling: isContinuousShuffling,
    startShuffling,
    stopShuffling,
    seedGenerator,
  } = useMysticalShuffle();
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/2b592729-be1a-46fb-8bcd-2c8271753022',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:43',message:'After useMysticalShuffle',data:{hasShuffleOnce:!!shuffleOnce},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C,E'})}).catch(()=>{});
  // #endregion

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/2b592729-be1a-46fb-8bcd-2c8271753022',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:46',message:'Before useCardStack',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C,E'})}).catch(()=>{});
  // #endregion
  const { drawnCards, drawCard, updateCard, bringToFront, returnCard, returnAllCards } = useCardStack();
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/2b592729-be1a-46fb-8bcd-2c8271753022',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:48',message:'After useCardStack',data:{drawnCardsCount:drawnCards.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C,E'})}).catch(()=>{});
  // #endregion
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
    const returned = returnCard(cardInstance.id);
    if (returned) {
      // Add card back to deck with its reversal state at a random position
      const card = getCardById(returned.cardId);
      if (card) {
        setDeck(prev => {
          const newDeck = [...prev, { card, isReversed: returned.isReversed }];
          // Shuffle to random position
          return shuffleOnce(newDeck);
        });
      }
    }
  }, [returnCard, getCardById, seedGenerator, shuffleOnce]);

  // Handle drag end - check if card was dropped on deck
  const handleDragEndWithCheck = useCallback((e: MouseEvent, cardId: string) => {
    // Check if we're over any deck (main deck or split decks)
    let deckElement: HTMLElement | null = null;
    
    if (isSplit) {
      // Check split decks - check both and use whichever one the mouse is over
      if (topHalfRef.current && topHalf.length > 0) {
        const topRect = topHalfRef.current.getBoundingClientRect();
        if (
          e.clientX >= topRect.left &&
          e.clientX <= topRect.right &&
          e.clientY >= topRect.top &&
          e.clientY <= topRect.bottom
        ) {
          deckElement = topHalfRef.current;
        }
      }
      if (!deckElement && bottomHalfRef.current && bottomHalf.length > 0) {
        const bottomRect = bottomHalfRef.current.getBoundingClientRect();
        if (
          e.clientX >= bottomRect.left &&
          e.clientX <= bottomRect.right &&
          e.clientY >= bottomRect.top &&
          e.clientY <= bottomRect.bottom
        ) {
          deckElement = bottomHalfRef.current;
        }
      }
    } else {
      // Check main deck
      if (deckRef.current && deck.length > 0) {
        deckElement = deckRef.current;
      }
    }
    
    if (!deckElement) return;

    const deckRect = deckElement.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Check if mouse is over the deck
    if (
      mouseX >= deckRect.left &&
      mouseX <= deckRect.right &&
      mouseY >= deckRect.top &&
      mouseY <= deckRect.bottom
    ) {
      // Find the card that was being dragged
      const cardInstance = drawnCards.find(c => c.id === cardId);
      if (cardInstance) {
        handleReturnCard(cardInstance);
      }
    }
  }, [drawnCards, handleReturnCard, deck.length, isSplit, topHalf.length, bottomHalf.length]);

  const { dragStart, rotateStart, handleDoubleClick, isDragging, isRotating } = useCardInteraction(updateCard, bringToFront, handleDragEndWithCheck, zoom, panOffset);

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
    if (isSplit) {
      if (fromTopHalf) {
        if (topHalf.length === 0) return;
        const topCard = topHalf[0];
        const seed = seedGenerator.generateSeed();
        drawCard(topCard.card, topCard.isReversed, seed, 'top', drawFaceUp);
        setTopHalf(prev => prev.slice(1));
      } else {
        if (bottomHalf.length === 0) return;
        const bottomCard = bottomHalf[0];
        const seed = seedGenerator.generateSeed();
        drawCard(bottomCard.card, bottomCard.isReversed, seed, 'bottom', drawFaceUp);
        setBottomHalf(prev => prev.slice(1));
      }
    } else {
      if (deck.length === 0) return;
      const topDeckCard = deck[0];
      const seed = seedGenerator.generateSeed();
      drawCard(topDeckCard.card, topDeckCard.isReversed, seed, 'main', drawFaceUp);
      setDeck(prev => prev.slice(1));
    }
  }, [deck, topHalf, bottomHalf, isSplit, drawCard, seedGenerator, drawFaceUp]);


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
      const midpoint = Math.floor(deck.length / 2);
      const firstHalf = deck.slice(0, midpoint);
      const secondHalf = deck.slice(midpoint);
      // Position the two halves side by side
      const currentX = deckPosition.x;
      const currentY = deckPosition.y;
      const topPos = { x: currentX - 80, y: currentY };
      const bottomPos = { x: currentX + 80, y: currentY };
      
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
    
    setDeck(prev => [...prev, ...cardsToAdd]);
  }, [returnAllCards]);

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

    const handlePanMove = (e: MouseEvent | TouchEvent) => {
      // Prevent default for touch to avoid scrolling
      if ('touches' in e) {
        e.preventDefault();
      }
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setPanOffset({
        x: clientX - panStart.x,
        y: clientY - panStart.y,
      });
    };

    const handlePanEnd = () => {
      setIsPanning(false);
    };

    document.addEventListener('mousemove', handlePanMove);
    document.addEventListener('mouseup', handlePanEnd);
    document.addEventListener('touchmove', handlePanMove, { passive: false });
    document.addEventListener('touchend', handlePanEnd);

    return () => {
      document.removeEventListener('mousemove', handlePanMove);
      document.removeEventListener('mouseup', handlePanEnd);
      document.removeEventListener('touchmove', handlePanMove);
      document.removeEventListener('touchend', handlePanEnd);
    };
  }, [isPanning, panStart]);

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
      
      // Check if deck has moved significantly (more than 5px)
      if (isSplit && draggedDeckId) {
        const currentPos = draggedDeckId === 'top' ? topHalfPosition : bottomHalfPosition;
        const dx = Math.abs(newPosition.x - currentPos.x);
        const dy = Math.abs(newPosition.y - currentPos.y);
        if (dx > 5 || dy > 5) {
          setDeckWasDragged(true);
        }
        
        // Update the specific deck being dragged
        if (draggedDeckId === 'top') {
          setTopHalfPosition(newPosition);
        } else {
          setBottomHalfPosition(newPosition);
        }
      } else if (!isSplit) {
        const dx = Math.abs(newPosition.x - deckPosition.x);
        const dy = Math.abs(newPosition.y - deckPosition.y);
        if (dx > 5 || dy > 5) {
          setDeckWasDragged(true);
        }
        setDeckPosition(newPosition);
      }
    };

    const handleDeckEnd = (e: MouseEvent) => {
      if (isSplit && draggedDeckId && deckWasDragged) {
        // Only check for rejoin if the deck was actually dragged (not just clicked)
        // Check if deck was dropped on the other deck
        const tableX = (e.clientX - panOffset.x) / zoom;
        const tableY = (e.clientY - panOffset.y) / zoom;
        const dropPosition = { x: tableX, y: tableY };
        
        const DECK_HITBOX = 120; // Approximate deck size
        const otherDeckPosition = draggedDeckId === 'top' ? bottomHalfPosition : topHalfPosition;
        const distance = Math.sqrt(
          Math.pow(dropPosition.x - otherDeckPosition.x, 2) + 
          Math.pow(dropPosition.y - otherDeckPosition.y, 2)
        );
        
        if (distance < DECK_HITBOX) {
          // Rejoin decks - dragged deck goes on top
          if (draggedDeckId === 'top') {
            setDeck([...topHalf, ...bottomHalf]);
          } else {
            setDeck([...bottomHalf, ...topHalf]);
          }
          setIsSplit(false);
          setTopHalf([]);
          setBottomHalf([]);
          // Reset deck position to the position of the deck that was dropped on
          setDeckPosition(otherDeckPosition);
        }
      }
      setIsDraggingDeck(false);
      setDraggedDeckId(null);
      setDeckWasDragged(false);
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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2b592729-be1a-46fb-8bcd-2c8271753022',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:323',message:'useEffect deckPosition entry',data:{deckPosition},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,E'})}).catch(()=>{});
    // #endregion
    if (isSplit) {
      setTopHalfPositionUtil(topHalfPosition);
      setBottomHalfPositionUtil(bottomHalfPosition);
    } else {
      setDeckPositionUtil(deckPosition);
      setTopHalfPositionUtil(null);
      setBottomHalfPositionUtil(null);
    }
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2b592729-be1a-46fb-8bcd-2c8271753022',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:326',message:'useEffect deckPosition exit',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,E'})}).catch(()=>{});
    // #endregion
  }, [deckPosition, topHalfPosition, bottomHalfPosition, isSplit]);

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/2b592729-be1a-46fb-8bcd-2c8271753022',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:330',message:'Before render return',data:{deckLength:deck.length,drawnCardsCount:drawnCards.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  return (
    <div className="app">
      {/* #region agent log */}
      {/* fetch('http://127.0.0.1:7242/ingest/2b592729-be1a-46fb-8bcd-2c8271753022',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:334',message:'Rendering JSX',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{}); */}
      {/* #endregion */}
      <Table
        drawnCards={drawnCards}
        getCardById={getCardById}
        onCardUpdate={updateCard}
        onDragStart={dragStart}
        onRotateStart={rotateStart}
        onDoubleClick={(card) => handleDoubleClick(card, updateCard)}
        isDragging={isDragging}
        isRotating={isRotating}
        zoom={zoom}
        panOffset={panOffset}
        onPanStart={handlePanStart}
        deckElement={
          isSplit ? (
            <>
              <div 
                ref={topHalfRef}
                style={{
                  position: 'absolute',
                  left: `${topHalfPosition.x}px`,
                  top: `${topHalfPosition.y}px`,
                }}
              >
                <Deck
                  cardCount={topHalf.length}
                  onDraw={() => handleDrawCard(true)}
                  deckRef={undefined}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsDraggingDeck(true);
                    setDraggedDeckId('top');
                    setDeckWasDragged(false);
                    const tableX = (e.clientX - panOffset.x) / zoom;
                    const tableY = (e.clientY - panOffset.y) / zoom;
                    setDeckDragStart({
                      x: tableX - topHalfPosition.x,
                      y: tableY - topHalfPosition.y,
                    });
                  }}
                />
              </div>
              <div 
                ref={bottomHalfRef}
                style={{
                  position: 'absolute',
                  left: `${bottomHalfPosition.x}px`,
                  top: `${bottomHalfPosition.y}px`,
                }}
              >
                <Deck
                  cardCount={bottomHalf.length}
                  onDraw={() => handleDrawCard(false)}
                  deckRef={undefined}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsDraggingDeck(true);
                    setDraggedDeckId('bottom');
                    setDeckWasDragged(false);
                    const tableX = (e.clientX - panOffset.x) / zoom;
                    const tableY = (e.clientY - panOffset.y) / zoom;
                    setDeckDragStart({
                      x: tableX - bottomHalfPosition.x,
                      y: tableY - bottomHalfPosition.y,
                    });
                  }}
                />
              </div>
            </>
          ) : (
            deck.length > 0 && (
              <div 
                style={{
                  position: 'absolute',
                  left: `${deckPosition.x}px`,
                  top: `${deckPosition.y}px`,
                }}
              >
                <Deck
                  cardCount={deck.length}
                  onDraw={() => handleDrawCard()}
                  deckRef={deckRef}
                  onMouseDown={handleDeckMouseDown}
                />
              </div>
            )
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
              setIsSessionLogOpen(prev => !prev);
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
              setShowInstructions(true);
              setIsMobileMenuOpen(false);
            }}
          />
          <div className="zoom-controls">
            <IconButton
              icon="➖"
              tooltip="Zoom Out"
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
            />
            <span className="zoom-value">{Math.round(zoom * 100)}%</span>
            <IconButton
              icon="➕"
              tooltip="Zoom In"
              onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
            />
          </div>
        </div>
      </div>
      <Instructions 
        isOpen={showInstructions} 
        onClose={() => setShowInstructions(false)} 
      />
    </div>
  );
}

export default App;

