// Card positioning utilities for drawing and stacking

export interface DrawPosition {
  x: number;
  y: number;
  rotation: number;
}

// Discard position is relative to deck position
// This will be set dynamically based on deck position
let deckPositionRef = { x: typeof window !== 'undefined' ? (window.innerWidth / 2 - 60) : 600, y: 200 };
let topHalfPositionRef: { x: number; y: number } | null = null;
let bottomHalfPositionRef: { x: number; y: number } | null = null;
const DECK_WIDTH = 140;
const DISCARD_OFFSET_X = 40; // Distance from deck right edge to discard pile

export const setDeckPosition = (position: { x: number; y: number }) => {
  deckPositionRef = position;
};

export const setTopHalfPosition = (position: { x: number; y: number } | null) => {
  topHalfPositionRef = position;
};

export const setBottomHalfPosition = (position: { x: number; y: number } | null) => {
  bottomHalfPositionRef = position;
};

export const getDiscardPosition = (deckId?: 'top' | 'bottom' | 'main'): { x: number; y: number } => {
  let deckPos = deckPositionRef;
  
  // If split, use the appropriate deck position
  if (deckId === 'top' && topHalfPositionRef) {
    deckPos = topHalfPositionRef;
  } else if (deckId === 'bottom' && bottomHalfPositionRef) {
    deckPos = bottomHalfPositionRef;
  }
  
  // Discard pile is to the right of the deck, at the same vertical level
  return {
    x: deckPos.x + DECK_WIDTH + DISCARD_OFFSET_X,
    y: deckPos.y, // Same Y position as deck (top-aligned)
  };
};
const STACK_OFFSET = 8; // Pixels offset for stacked cards
const POSITION_THRESHOLD = 20; // Pixels - if card moved more than this, consider it moved

// Generate random rotation between -3 and +3 degrees from ideal upright (0 degrees)
export const generateRandomRotation = (seed?: number): number => {
  const random = seed !== undefined ? seededRandom(seed) : Math.random();
  return (random * 6) - 3; // -3 to +3 degrees from upright
};

// Generate position offset for stacking (5-10px in random direction)
export const generateStackPositionOffset = (seed?: number): { x: number; y: number } => {
  const random1 = seed !== undefined ? seededRandom(seed) : Math.random();
  const random2 = seed !== undefined ? seededRandom(seed * 2) : Math.random();
  const angle = random1 * Math.PI * 2; // Random angle
  const distance = 5 + (random2 * 5); // 5-10px
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
  };
};


// Check if a position is close to any discard position (card hasn't been moved)
export const isAtDiscardPosition = (position: { x: number; y: number }, deckId?: 'top' | 'bottom' | 'main'): boolean => {
  const discardPos = getDiscardPosition(deckId);
  const dx = position.x - discardPos.x;
  const dy = position.y - discardPos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance <= POSITION_THRESHOLD;
};

// Calculate draw position for a new card
export const calculateDrawPosition = (
  previousCard?: DrawPosition,
  seed?: number,
  deckId?: 'top' | 'bottom' | 'main'
): DrawPosition => {
  const discardPos = getDiscardPosition(deckId);
  
  // If no previous card, use discard position with random rotation
  if (!previousCard) {
    return {
      x: discardPos.x,
      y: discardPos.y,
      rotation: generateRandomRotation(seed),
    };
  }

  // Check if previous card is still at discard position (hasn't been moved)
  const previousPos = { x: previousCard.x, y: previousCard.y };
  if (isAtDiscardPosition(previousPos, deckId)) {
    // Card hasn't been moved - stack on top with slight offset
    const positionOffset = generateStackPositionOffset(seed);
    return {
      x: previousCard.x + positionOffset.x,
      y: previousCard.y + positionOffset.y,
      rotation: generateRandomRotation(seed), // Always relative to upright, not previous card
    };
  } else {
    // Card was moved - place new card at discard position
    return {
      x: discardPos.x,
      y: discardPos.y,
      rotation: generateRandomRotation(seed),
    };
  }
};

// Simple seeded random number generator
const seededRandom = (seed: number): number => {
  // Simple LCG (Linear Congruential Generator)
  const a = 1664525;
  const c = 1013904223;
  const m = Math.pow(2, 32);
  const nextSeed = (seed * a + c) % m;
  return nextSeed / m;
};

