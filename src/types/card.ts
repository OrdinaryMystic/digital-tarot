// Base card definition (immutable, 78 total)
export interface Card {
  id: string;                    // e.g., "major-00-fool" or "minor-wands-ace"
  name: string;                  // "The Fool", "Ace of Wands"
  suit: 'major' | 'wands' | 'cups' | 'swords' | 'pentacles';
  value: number | string;        // 0-21 for major, 1-14 for minor
  arcana: 'major' | 'minor';
  imagePath: string;
  defaultMeaning?: string;       // Base meaning (future)
}

// Card instance on the table (mutable state)
export interface CardInstance {
  id: string;                    // Unique instance ID
  cardId: string;                // Reference to Card.id
  position: { x: number; y: number };
  rotation: number;              // Degrees
  isReversed: boolean;
  isFlipped: boolean;            // Face up/down
  zIndex: number;
  drawnAt: Date;
  // Future: readingId, spreadPositionId, notes
}

