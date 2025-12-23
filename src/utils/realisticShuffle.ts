import seedrandom from 'seedrandom';

/**
 * Realistic shuffling algorithms that simulate physical card shuffling
 * by redistributing chunks of cards rather than randomizing individual positions
 */

// Riffle shuffle: Split deck roughly in half, then interlace cards one-by-one with variations
// Also handles reversals: one half becomes reversed
export interface DeckCard {
  card: any;
  isReversed: boolean;
}

export const riffleShuffle = (deck: DeckCard[], seed: number): DeckCard[] => {
  const rng = seedrandom(seed.toString());
  const deckSize = deck.length;
  
  // Determine split point (not exactly 50/50, varies based on seed)
  const splitVariation = (rng() - 0.5) * 0.2; // ±10% variation
  const splitPoint = Math.floor(deckSize * (0.5 + splitVariation));
  
  let leftHalf = deck.slice(0, splitPoint);
  let rightHalf = deck.slice(splitPoint);
  
  // Determine which half gets reversed (50/50 chance)
  const flipLeft = rng() < 0.5;
  if (flipLeft) {
    // Flip left half
    leftHalf = leftHalf.map(card => ({ ...card, isReversed: !card.isReversed }));
  } else {
    // Flip right half
    rightHalf = rightHalf.map(card => ({ ...card, isReversed: !card.isReversed }));
  }
  
  const result: DeckCard[] = [];
  let leftIndex = 0;
  let rightIndex = 0;
  
  // Interlace cards one-by-one with pattern variations
  while (leftIndex < leftHalf.length || rightIndex < rightHalf.length) {
    const leftRemaining = leftHalf.length - leftIndex;
    const rightRemaining = rightHalf.length - rightIndex;
    
    if (leftRemaining === 0) {
      // Only right half left - add all remaining
      result.push(...rightHalf.slice(rightIndex));
      break;
    } else if (rightRemaining === 0) {
      // Only left half left - add all remaining
      result.push(...leftHalf.slice(leftIndex));
      break;
    } else {
      // Both halves available - determine pattern variation
      // Pattern can be: 1-3 cards from one side before switching
      // This creates variations like: L-R-L-R, L-L-R-L-R, L-R-R-L-R, etc.
      
      // Determine how many cards to take from current side (1-3 cards)
      const cardsFromCurrentSide = Math.floor(rng() * 3) + 1;
      
      // Determine which side to take from (weighted by remaining cards)
      // Bias slightly toward the side with more cards remaining
      const leftRatio = leftRemaining / (leftRemaining + rightRemaining);
      const takeFromLeft = rng() < (leftRatio + 0.1); // Slight bias
      
      if (takeFromLeft) {
        // Take 1-3 cards from left
        const actualCount = Math.min(cardsFromCurrentSide, leftRemaining);
        result.push(...leftHalf.slice(leftIndex, leftIndex + actualCount));
        leftIndex += actualCount;
      } else {
        // Take 1-3 cards from right
        const actualCount = Math.min(cardsFromCurrentSide, rightRemaining);
        result.push(...rightHalf.slice(rightIndex, rightIndex + actualCount));
        rightIndex += actualCount;
      }
    }
  }
  
  return result;
};

// Overhand shuffle: Take chunks from top and redistribute
// Returns the result and also provides a function to process one chunk at a time
export const overhandShuffle = (deck: DeckCard[], seed: number): DeckCard[] => {
  const rng = seedrandom(seed.toString());
  let remaining = [...deck];
  const result: DeckCard[] = [];
  
  // Single overhand pass (for continuous shuffling, we'll do one pass at a time)
  while (remaining.length > 0) {
    // Determine chunk size to take from top (1-5 cards for more realistic shuffling)
    const maxChunkSize = Math.min(5, Math.floor(remaining.length * 0.2));
    const chunkSize = Math.floor(rng() * maxChunkSize) + 1;
    const actualChunkSize = Math.min(chunkSize, remaining.length);
    
    // Take chunk from top
    const chunk = remaining.slice(0, actualChunkSize);
    remaining = remaining.slice(actualChunkSize);
    
    // Decide where to place it (at beginning, middle, or end of result)
    const position = rng();
    if (position < 0.3) {
      // Place at beginning
      result.unshift(...chunk);
    } else if (position < 0.7 && result.length > 0) {
      // Place in middle
      const insertIndex = Math.floor(rng() * result.length);
      result.splice(insertIndex, 0, ...chunk);
    } else {
      // Place at end
      result.push(...chunk);
    }
  }
  
  return result;
};

// Overhand shuffle chunk processor - processes one chunk at a time for animation
export interface OverhandShuffleState {
  remaining: DeckCard[];
  result: DeckCard[];
  isComplete: boolean;
}

export const createOverhandShuffleState = (deck: DeckCard[]): OverhandShuffleState => {
  return {
    remaining: [...deck],
    result: [],
    isComplete: false,
  };
};

export const processOverhandChunk = (
  state: OverhandShuffleState,
  seed: number,
  chunkIndex: number
): OverhandShuffleState => {
  if (state.isComplete) return state;
  
  const rng = seedrandom((seed + chunkIndex).toString());
  const newState = { ...state };
  
  if (newState.remaining.length === 0) {
    // Start a new pass - move result back to remaining
    newState.remaining = [...newState.result];
    newState.result = [];
  }
  
  if (newState.remaining.length === 0) {
    newState.isComplete = true;
    return newState;
  }
  
  // Determine chunk size to take from top (1-5 cards for more realistic shuffling)
  const maxChunkSize = Math.min(5, Math.floor(newState.remaining.length * 0.2));
  const chunkSize = Math.floor(rng() * maxChunkSize) + 1;
  const actualChunkSize = Math.min(chunkSize, newState.remaining.length);
  
  // Take chunk from top
  const chunk = newState.remaining.slice(0, actualChunkSize);
  newState.remaining = newState.remaining.slice(actualChunkSize);
  
  // Decide where to place it (at beginning, middle, or end of result)
  const position = rng();
  if (position < 0.3) {
    // Place at beginning
    newState.result.unshift(...chunk);
  } else if (position < 0.7 && newState.result.length > 0) {
    // Place in middle
    const insertIndex = Math.floor(rng() * newState.result.length);
    newState.result.splice(insertIndex, 0, ...chunk);
  } else {
    // Place at end
    newState.result.push(...chunk);
  }
  
  return newState;
};

// Hybrid shuffle: Combines riffle and overhand techniques
export const hybridShuffle = (deck: DeckCard[], seed: number): DeckCard[] => {
  const rng = seedrandom(seed.toString());
  let result = [...deck];
  
  // Determine number of shuffle operations (2-5)
  const numOperations = Math.floor(rng() * 4) + 2;
  
  for (let i = 0; i < numOperations; i++) {
    // Use different seed for each operation
    const operationSeed = seed + i * 1000;
    const operationRng = seedrandom(operationSeed.toString());
    
    // Decide which technique to use (60% riffle, 40% overhand)
    if (operationRng() < 0.6) {
      result = riffleShuffle(result, operationSeed);
    } else {
      result = overhandShuffle(result, operationSeed);
    }
  }
  
  return result;
};

