export interface Spread {
  id: string;
  name: string;
  description?: string;
  positions: SpreadPosition[];
  isCustom: boolean;
  createdBy?: string;            // User ID (future)
}

export interface SpreadPosition {
  id: string;
  name: string;                  // e.g., "Past", "Present", "Future"
  x: number;                     // Default position on table
  y: number;
  angle?: number;                // Default rotation
}

