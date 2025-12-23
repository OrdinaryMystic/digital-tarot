import { CardInstance } from './card';

export interface Reading {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title?: string;
  clientId?: string;            // Future: link to client
  spreadId?: string;             // Future: custom spread template
  cards: CardInstance[];         // Cards in this reading
  notes: ReadingNote[];          // Visual sticky notes + text notes
  summary?: string;              // Non-visual summary
  // Future: AI insights, tags, etc.
}

export interface ReadingNote {
  id: string;
  cardInstanceId?: string;      // Attached to specific card
  position: { x: number; y: number }; // Visual position
  content: string;
  type: 'sticky' | 'text';      // Visual sticky note or text note
}

