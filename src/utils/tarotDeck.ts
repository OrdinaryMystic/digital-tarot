import { Card } from '../types/card';

// Major Arcana (22 cards)
const majorArcana: Omit<Card, 'imagePath'>[] = [
  { id: 'major-00', name: 'The Fool', suit: 'major', value: 0, arcana: 'major' },
  { id: 'major-01', name: 'The Magician', suit: 'major', value: 1, arcana: 'major' },
  { id: 'major-02', name: 'The High Priestess', suit: 'major', value: 2, arcana: 'major' },
  { id: 'major-03', name: 'The Empress', suit: 'major', value: 3, arcana: 'major' },
  { id: 'major-04', name: 'The Emperor', suit: 'major', value: 4, arcana: 'major' },
  { id: 'major-05', name: 'The Hierophant', suit: 'major', value: 5, arcana: 'major' },
  { id: 'major-06', name: 'The Lovers', suit: 'major', value: 6, arcana: 'major' },
  { id: 'major-07', name: 'The Chariot', suit: 'major', value: 7, arcana: 'major' },
  { id: 'major-08', name: 'Strength', suit: 'major', value: 8, arcana: 'major' },
  { id: 'major-09', name: 'The Hermit', suit: 'major', value: 9, arcana: 'major' },
  { id: 'major-10', name: 'Wheel of Fortune', suit: 'major', value: 10, arcana: 'major' },
  { id: 'major-11', name: 'Justice', suit: 'major', value: 11, arcana: 'major' },
  { id: 'major-12', name: 'The Hanged Man', suit: 'major', value: 12, arcana: 'major' },
  { id: 'major-13', name: 'Death', suit: 'major', value: 13, arcana: 'major' },
  { id: 'major-14', name: 'Temperance', suit: 'major', value: 14, arcana: 'major' },
  { id: 'major-15', name: 'The Devil', suit: 'major', value: 15, arcana: 'major' },
  { id: 'major-16', name: 'The Tower', suit: 'major', value: 16, arcana: 'major' },
  { id: 'major-17', name: 'The Star', suit: 'major', value: 17, arcana: 'major' },
  { id: 'major-18', name: 'The Moon', suit: 'major', value: 18, arcana: 'major' },
  { id: 'major-19', name: 'The Sun', suit: 'major', value: 19, arcana: 'major' },
  { id: 'major-20', name: 'Judgement', suit: 'major', value: 20, arcana: 'major' },
  { id: 'major-21', name: 'The World', suit: 'major', value: 21, arcana: 'major' },
];

// Minor Arcana suits
const suits = ['wands', 'cups', 'swords', 'pentacles'] as const;
const minorValues = [
  { value: 1, name: 'Ace' },
  { value: 2, name: 'Two' },
  { value: 3, name: 'Three' },
  { value: 4, name: 'Four' },
  { value: 5, name: 'Five' },
  { value: 6, name: 'Six' },
  { value: 7, name: 'Seven' },
  { value: 8, name: 'Eight' },
  { value: 9, name: 'Nine' },
  { value: 10, name: 'Ten' },
  { value: 11, name: 'Page' },
  { value: 12, name: 'Knight' },
  { value: 13, name: 'Queen' },
  { value: 14, name: 'King' },
];

// Generate Minor Arcana (56 cards)
const minorArcana: Omit<Card, 'imagePath'>[] = [];
suits.forEach(suit => {
  minorValues.forEach(({ value, name }) => {
    minorArcana.push({
      id: `minor-${suit}-${value}`,
      name: `${name} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`,
      suit: suit as 'wands' | 'cups' | 'swords' | 'pentacles',
      value,
      arcana: 'minor',
    });
  });
});

// Combine all cards
const allCards: Omit<Card, 'imagePath'>[] = [...majorArcana, ...minorArcana];

// Helper function to convert card ID to filename
const getCardImageFilename = (cardId: string): string => {
  // Major Arcana: major-00 -> maj00, major-01 -> maj01, etc.
  if (cardId.startsWith('major-')) {
    const num = cardId.replace('major-', '').padStart(2, '0');
    return `maj${num}.jpg`;
  }
  
  // Minor Arcana: minor-wands-1 -> wands01, minor-cups-2 -> cups02, etc.
  if (cardId.startsWith('minor-')) {
    const parts = cardId.replace('minor-', '').split('-');
    const suit = parts[0];
    const value = parts[1];
    
    // Map suit names to filename prefixes
    const suitMap: Record<string, string> = {
      'wands': 'wands',
      'cups': 'cups',
      'swords': 'swords',
      'pentacles': 'pents'
    };
    
    const suitPrefix = suitMap[suit] || suit;
    const paddedValue = value.padStart(2, '0');
    return `${suitPrefix}${paddedValue}.jpg`;
  }
  
  // Fallback to original format
  return `${cardId}.jpg`;
};

// Create full deck with image paths
export const createFullDeck = (): Card[] => {
  return allCards.map(card => ({
    ...card,
    imagePath: `/cards/${getCardImageFilename(card.id)}`,
  }));
};

// Get card by ID
export const getCardById = (id: string, deck: Card[]): Card | undefined => {
  return deck.find(card => card.id === id);
};

// Create a new shuffled deck
export const createShuffledDeck = (shuffleFn: (deck: Card[]) => Card[]): Card[] => {
  const deck = createFullDeck();
  return shuffleFn([...deck]);
};

