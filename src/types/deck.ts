import { Card } from './card';

// Card in the deck with reversal state
export interface DeckCard {
  card: Card;
  isReversed: boolean;
}

